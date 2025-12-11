import express from "express";
import { getTickets, createTicket, updateTicket, deleteTicket } from "../../../controllers/admin/ticket.js";
import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// GET all tickets
router.get("/", Auth.AdminAuth, getTickets);

// CREATE ticket
router.post(
  "/",
  Auth.AdminAuth,
  upload.fields([
    { name: "videos", maxCount: 20 },
    { name: "images", maxCount: 20 }
  ]),
  createTicket
);

// UPDATE ticket
router.put(
  "/:ticketId",
  Auth.AdminAuth,
  upload.fields([
    { name: "videos", maxCount: 20 },
    { name: "images", maxCount: 20 }
  ]),
  updateTicket
);

// DELETE ticket
router.delete("/:id", Auth.AdminAuth, deleteTicket);

export default router;
