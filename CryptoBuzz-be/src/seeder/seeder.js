import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
const admins = [
  {
    first_name:"Admin",
    last_name:"One",
    name: "Admin One",
    email: "admin@cryptobuzz.in",
    password: "3XC^c^@NpZu",
    role: "admin",
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
      } else {
      }
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

export default {
  seedAdmins
};
