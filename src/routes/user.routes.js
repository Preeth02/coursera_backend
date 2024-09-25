import { Router } from "express";
const router = Router();

router.route("/register").get(function (req, res) {
  res.json({
    message: "Yumm working fine",
  });
});

export default router;
