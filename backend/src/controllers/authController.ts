import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { db } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Customer, User } from '../models/types.js';

function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
}

function sanitizeUser(user: User) {
  const { password, ...safe } = user;
  return safe;
}

export class AuthController {
  public static register(req: AuthenticatedRequest, res: Response) {
    const { name, email, password, password_confirmation, phone, company } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password_confirmation && password !== password_confirmation) {
      return res.status(422).json({
        success: false,
        message: 'Password confirmation does not match.',
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const existing = db.users.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (existing) {
      return res.status(422).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const now = new Date().toISOString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUserId = db.nextId('users');

    const newUser: User = {
      id: newUserId,
      uuid: uuidv4(),
      name,
      email: emailTrimmed,
      password: hashedPassword,
      phone,
      company,
      role: 'customer',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    db.users.push(newUser);

    // Create associated customer profile if not already present
    let customer = db.customers.find((c) => c.email.toLowerCase() === emailTrimmed);
    if (!customer) {
      const newCustId = db.nextId('customers');
      customer = {
        id: newCustId,
        uuid: uuidv4(),
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        company: newUser.company,
        status: 'active',
        created_at: now,
        updated_at: now,
      };
      db.customers.push(customer);
    } else {
      customer.user_id = newUser.id;
    }

    db.logAudit('user_register', `New user registered: ${newUser.email}`, newUser);
    db.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: sanitizeUser(newUser),
        token,
        token_type: 'Bearer',
      },
    });
  }

  public static login(req: AuthenticatedRequest, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === emailTrimmed);

    if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password provided.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const token = generateToken(user);
    db.logAudit('user_login', `User logged in: ${user.email}`, user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        token,
        token_type: 'Bearer',
      },
    });
  }

  public static me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }
    return res.json({
      success: true,
      data: sanitizeUser(req.user),
    });
  }

  public static updateProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { name, phone, company } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (company !== undefined) req.user.company = company;
    req.user.updated_at = new Date().toISOString();

    const customer = db.customers.find((c) => c.user_id === req.user!.id);
    if (customer) {
      if (name) customer.name = name;
      if (phone !== undefined) customer.phone = phone;
      if (company !== undefined) customer.company = company;
      customer.updated_at = new Date().toISOString();
    }

    db.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(req.user),
    });
  }

  public static changePassword(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(422).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (!req.user.password || !bcrypt.compareSync(current_password, req.user.password)) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    req.user.password = bcrypt.hashSync(new_password, 10);
    req.user.updated_at = new Date().toISOString();
    db.save();

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  public static logout(req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
