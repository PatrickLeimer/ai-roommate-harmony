
import { MongoClient, Collection, Db } from 'mongodb';
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
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private userCollection: Collection<User> | null = null;
  private connected: boolean = false;
  private readonly JWT_SECRET = 'flatmate-ai-secret-key'; // In production, use environment variable

  constructor() {
    this.initConnection();
  }

  private async initConnection() {
    try {
      // Get MongoDB URI from localStorage (temporary solution)
      const uri = localStorage.getItem('mongodb_uri');
      
      if (uri) {
        this.client = new MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db('flatmateai');
        this.userCollection = this.db.collection<User>('users');
        this.connected = true;
        console.log('Connected to MongoDB');
      }
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.connected = false;
    }
  }

  public async setMongoURI(uri: string): Promise<boolean> {
    try {
      // Test connection
      const testClient = new MongoClient(uri);
      await testClient.connect();
      await testClient.close();
      
      // Store URI and reconnect
      localStorage.setItem('mongodb_uri', uri);
      await this.initConnection();
      return this.connected;
    } catch (error) {
      console.error('Invalid MongoDB URI:', error);
      return false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async register(user: Omit<User, '_id' | 'createdAt'>): Promise<{ success: boolean; message: string; token?: string }> {
    if (!this.connected || !this.userCollection) {
      return { success: false, message: 'Database not connected' };
    }

    try {
      // Check if user exists
      const existingUser = await this.userCollection.findOne({ email: user.email });
      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password || '', salt);

      // Create new user
      const newUser: User = {
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: new Date(),
      };

      // Insert user
      await this.userCollection.insertOne(newUser);

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
    if (!this.connected || !this.userCollection) {
      return { success: false, message: 'Database not connected' };
    }

    try {
      // Find user
      const user = await this.userCollection.findOne({ email });
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
