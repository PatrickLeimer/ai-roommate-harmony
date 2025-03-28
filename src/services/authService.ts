
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  _id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

class AuthService {
  private users: User[] = [];
  private connected: boolean = false;
  private readonly JWT_SECRET = 'flatmate-ai-secret-key'; // In production, use environment variable

  constructor() {
    // Load users from localStorage if available
    this.loadUsers();
  }

  private loadUsers() {
    try {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        this.users.forEach(user => {
          // Convert string date back to Date object
          user.createdAt = new Date(user.createdAt);
        });
      }
      
      // Check if there's a stored MongoDB URI
      const uri = localStorage.getItem('mongodb_uri');
      this.connected = !!uri;
      
      console.log('Loaded users from local storage:', this.users.length);
    } catch (error) {
      console.error('Failed to load users from localStorage:', error);
    }
  }

  private saveUsers() {
    try {
      localStorage.setItem('users', JSON.stringify(this.users));
    } catch (error) {
      console.error('Failed to save users to localStorage:', error);
    }
  }

  public async setMongoURI(uri: string): Promise<boolean> {
    try {
      // Simply store the URI for future reference
      // In a real app, we would test the connection here
      localStorage.setItem('mongodb_uri', uri);
      this.connected = true;
      return true;
    } catch (error) {
      console.error('Invalid MongoDB URI:', error);
      return false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async register(user: Omit<User, '_id' | 'createdAt'>): Promise<{ success: boolean; message: string; token?: string }> {
    if (!this.connected) {
      return { success: false, message: 'Database not connected' };
    }

    try {
      // Check if user exists
      const existingUser = this.users.find(u => u.email === user.email);
      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password || '', salt);

      // Create new user
      const newUser: User = {
        _id: Date.now().toString(), // Simple ID generation
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: new Date(),
      };

      // Add user to array and save
      this.users.push(newUser);
      this.saveUsers();

      // Generate JWT
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        this.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return { success: true, message: 'User registered successfully', token };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  public async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: Omit<User, 'password'> }> {
    if (!this.connected) {
      return { success: false, message: 'Database not connected' };
    }

    try {
      // Find user
      const user = this.users.find(u => u.email === email);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password || '');
      if (!isMatch) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.email },
        this.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create user object without password
      const { password: _, ...userWithoutPassword } = user;

      return { 
        success: true, 
        message: 'Login successful', 
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  public verifyToken(token: string): { valid: boolean; userId?: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string };
      return { valid: true, userId: decoded.id };
    } catch (error) {
      return { valid: false };
    }
  }
}

export const authService = new AuthService();
