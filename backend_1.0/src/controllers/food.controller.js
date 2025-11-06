import Food from "../models/Food.js";

const createFood = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, description, category, price, isUniversal, image } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and price are required",
      });
    }

    if (isUniversal && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can create universal food items",
      });
    }

    if (req.user.role === "FRANCHISE_ADMIN" && !req.user.franchiseId) {
      return res.status(400).json({
        success: false,
        message: "Franchise admin must be associated with a franchise",
      });
    }

    const existingFood = await Food.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      $or: [
        { franchiseId: req.user.franchiseId || null },
        { isUniversal: true },
      ],
    });

    if (existingFood) {
      return res.status(400).json({
        success: false,
        message: "A food item with this name already exists.",
      });
    }

    const food = await Food.create({
      name: name.trim(),
      description,
      category,
      price: Number(price),
      franchiseId: isUniversal ? null : req.user.franchiseId || null,
      isUniversal: Boolean(isUniversal),
      image,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `${
        isUniversal ? "Universal" : "Franchise"
      } food created successfully.`,
      data: food,
    });
  } catch (error) {
    console.error("❌ Create Food Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create food item.",
    });
  }
};

const getAllFoods = async (req, res) => {
  try {
    const { franchiseId, category, isAvailable, isUniversal, search } =
      req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    let orConditions = [];

    if (req.user.role === "FRANCHISE_ADMIN") {
      orConditions.push(
        { franchiseId: req.user.franchiseId },
        { isUniversal: true }
      );
    } else if (req.user.role === "SUPER_ADMIN" && franchiseId) {
      orConditions.push({ franchiseId }, { isUniversal: true });
    }

    if (category) {
      filter.category = category;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    if (isUniversal !== undefined && req.user.role === "SUPER_ADMIN") {
      filter.isUniversal = isUniversal === "true";
    }

    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      orConditions.push(...searchConditions);
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const [foods, total] = await Promise.all([
      Food.find(filter)
        .populate("createdBy", "name email")
        .populate("franchiseId", "businessName")
        .sort({ isUniversal: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        foods,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFood = await Food.findById(id);

    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (existingFood.isUniversal && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can update universal food items",
      });
    }

    if (
      !existingFood.isUniversal &&
      existingFood.franchiseId?.toString() !==
        req.user.franchiseId?.toString() &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own franchise food items",
      });
    }

    const updateData = { ...req.body };
    if (req.user.role !== "SUPER_ADMIN") {
      delete updateData.isUniversal;
      delete updateData.franchiseId;
    }

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      success: true,
      message: "Food item updated successfully",
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFood = await Food.findById(id);

    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (existingFood.isUniversal && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can delete universal food items",
      });
    }

    if (
      !existingFood.isUniversal &&
      existingFood.franchiseId?.toString() !==
        req.user.franchiseId?.toString() &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own franchise food items",
      });
    }

    await Food.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleFoodAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Food ID format",
      });
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    if (food.isUniversal && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "Only Super Admin can change availability of universal food items",
      });
    }

    if (
      !food.isUniversal &&
      food.franchiseId?.toString() !== req.user.franchiseId?.toString() &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only toggle availability for your own franchise food items",
      });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.json({
      success: true,
      message: `Food item is now ${
        food.isAvailable ? "available" : "unavailable"
      }`,
      data: {
        _id: food._id,
        name: food.name,
        isAvailable: food.isAvailable,
      },
    });
  } catch (error) {
    console.error("Error toggling food availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      timestamp: new Date().toISOString(),
    });
  }
};

export { createFood, getAllFoods, updateFood, deleteFood,toggleFoodAvailability };
