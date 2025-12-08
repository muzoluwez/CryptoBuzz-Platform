import express  from"express"; // import the express module
import {getIdea,createIdea,updateIdea,deleteIdea}  from"../../../controllers/common/idea.js";
import Auth   from "../../../middlewares/auth.js";
import { upload }  from"../../../middlewares/multer.js";
const router = express.Router();

router.get("/get", Auth.CommonAuth, getIdea);
router.get("/list", Auth.CommonAuth, getIdea);
router.post("/create", Auth.CommonAuth, upload.array("files", 3), createIdea);
router.put("/updated/:id", Auth.CommonAuth, upload.array("files", 3), updateIdea);
router.delete("/remove/:id", Auth.CommonAuth, deleteIdea);

export default router;
