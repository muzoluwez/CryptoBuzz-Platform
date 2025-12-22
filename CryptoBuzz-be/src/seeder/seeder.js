import UserModel from "../models/user.js";
import UserCredential from "../models/userCredential.js";
import bcrypt from "bcrypt";

const admins = [
  {
    first_name: "Admin",
    last_name: "One",
    name: "Admin One",
    email: "admin@cryptobuzz.in",
    password: "3XC^c^@NpZu",
    role: "admin",
    status: "true"
  }
];

const users = [
  {
    first_name: "User",
    last_name: "One",
    name: "User One",
    email: "user@cryptobuzz.in",
    password: "3XC^c^@NpZu",
    status: "true"
  }
];

export const seedAdmins = async () => {
  try {
    for (let admin of admins) {
      const existingAdmin = await UserModel.findOne({ email: admin.email });
      if (!existingAdmin) {
        admin.password = await bcrypt.hash(admin.password, 10);
        await UserModel.create(admin);
        console.log(`Admin ${admin.email} seeded successfully.`);
      }
    }
  } catch (error) {
    console.error("Admin seeding error:", error);
  }
};

export const seedUsers = async () => {
  try {
    for (let user of users) {
      const existingUser = await UserCredential.findOne({ email: user.email });
      if (!existingUser) {
        user.password = await bcrypt.hash(user.password, 10);
        await UserCredential.create(user);
        console.log(`User ${user.email} seeded successfully.`);
      }
    }
  } catch (error) {
    console.error("User seeding error:", error);
  }
};

export default {
  seedAdmins,
  seedUsers
};
