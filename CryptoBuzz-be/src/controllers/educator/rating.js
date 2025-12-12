import Rating from "../../models/rating.js";
import User from "../../models/user.js";

export const getMyRatings = async (req, res) => {
  try {
    const educatorId = req.query.educatorId;
    if (!educatorId) {
      return res.status(400).json({ message: "Educator not found" });
    }

    const educator = await User.findById(educatorId)
      .select("name first_name last_name email image avgRating ratingCount")
      .populate("categories", "name");

    if (!educator) {
      return res.status(404).json({ message: "Educator not found in users" });
    }

    let { page = 1, limit = 10, search = "", sort = "-createdAt" } = req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? { comment: { $regex: search, $options: "i" } }
      : {};

    const query = {
      educator: educatorId,
      isDeleted: false,
      ...searchFilter,
    };

    const ratings = await Rating.find(query)
      .populate("user", "name image")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Rating.countDocuments(query);

    const Ratings = ratings.map((r) => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: {
        _id: r.user?._id,
        name: r.user?.name,
        image: r.user?.image,
      },
    }));

    return res.status(200).json({
      message: "Ratings fetched",

      educator: {
        _id: educator._id,
        name:
          educator.name ||
          `${educator.first_name || ""} ${educator.last_name || ""}`.trim(),
        email: educator.email,
        image: educator.image,
        categories: educator.categories || [],
        avrageRating: educator.avgRating || 0,
        ratingCount: educator.ratingCount || 0,
      },

      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },

      data: Ratings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
