import User from "../../models/user.js";

export const getEducatorsRatings = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sort = "-avgRating" } = req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { first_name: { $regex: search, $options: "i" } },
            { last_name: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const matchQuery = {
      role: "educator",
      email: { $ne: "corporate@iqonic.vip" },
      status: "true",
      isDeleted: false,
      ...searchFilter,
    };

    const total = await User.countDocuments(matchQuery);

    const educators = await User.aggregate([
      { $match: matchQuery },

      {
        $addFields: {
          followersCount: { $size: { $ifNull: ["$followers", []] } },
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },

      {
        $sort: {
          [sort.replace("-", "")]: sort.startsWith("-") ? -1 : 1,
        },
      },

      { $skip: skip },
      { $limit: limit },

      {
        $project: {
          name: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          image: 1,
          bannerImage: 1,
          avgRating: 1,
          ratingCount: 1,
          followersCount: 1,
          categoryDetails: {
            $map: {
              input: "$categoryDetails",
              as: "cat",
              in: {
                _id: "$$cat._id",
                name: "$$cat.name",
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Educator rating list",
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      data: educators,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
