const User = require('../models/user');
const Address = require('../models/user-address');
const util = require('../functions/util');

module.exports.createUser = async (req, res) => {
    req.body.user_type = req.params.userType;
    const existingUser = await User.findOne({ phone_number: req.body.phone_number });
    if (existingUser) return res.status(400).json({
        err: "User already exists"
    });
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save user in DB"
            });
        }
        res.json(user);
    });
};

module.exports.editUser = async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    Object.keys(req.body).forEach(key => {
        user[key] = req.body[key];
    });

    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save user in DB"
            });
        }
        res.json(user);
    });
};

module.exports.generateOtp = async (req, res) => {
    const user = await User.findOne({ phone_number: req.params.mobile_no });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    if (!user.verified) {
        return res.status(400).json({
            err: "User not verified"
        });
    }

    const otp = util.generateTestOtp();
    user.otp_verified = false;
    user.otp = otp;

    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save user in DB"
            });
        }
        console.log(user);
        res.json({
            message: "OTP generated successfully",
            success: true,
        });
    });
};


module.exports.verifyOtp = async (req, res) => {
    const user = await User.findOne({ phone_number: req.params.mobile_no });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    if (user.otp === req.params.otp && user.verified) {
        user.otp_verified = true;
        user.save((err, user) => {
            if (err) {
                return res.status(400).json({
                    err: "NOT able to save user in DB"
                });
            }
            return res.json({
                message: "OTP verified successfully",
                success: true,
                token: util.generateJsonWebToken(user),
            });
        });
    } else
        return res.json({
            message: "OTP verification failed",
            success: false,
        });
};

module.exports.getUser = async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    return res.json({
        user: user,
        success: true,
    });
};

module.exports.getAllUsers = async (req, res) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const skipIndex = (page - 1) * limit;

    const users = await User.find({}).skip(skipIndex).limit(limit);

    if (!users) {
        return res.status(400).json({
            err: "Users not found"
        });
    }

    return res.json({
        users: users,
        success: true,
    });
};

module.exports.toggleVerification = async (req, res) => {
    const user = await User.findOne({ _id: req.params.user_id });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    user.verified = !user.verified;
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save user in DB"
            });
        }
        return res.json({
            message: "User verification toggled successfully",
            success: true,
        });
    });
};

module.exports.addAddress = async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    const address = new Address({
        user_id: req.userId,
        address: req.body.address,
        title: req.params.title,
    });

    address.save((err) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save address in DB"
            });
        }
        return res.json({
            message: "Address saved successfully",
            success: true,
        });
    });
};

module.exports.editAddress = async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    const address = await Address.findOne({ _id: req.params.address_id });

    if (!address) {
        return res.status(400).json({
            err: "Address not found"
        });
    }

    address.address = req.body.address || address.address;
    address.title = req.body.title || address.title;
    
    address.save((err) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save address in DB"
            });
        }
        return res.json({
            message: "Address saved successfully",
            success: true,
        });
    });
};

module.exports.deleteAddress = async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    const address = await Address.findOne({ _id: req.params.address_id });

    if (!address) {
        return res.status(400).json({
            err: "Address not found"
        });
    }

    address.is_viewable = false;
    
    address.save((err) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save address in DB"
            });
        }
        return res.json({
            message: "Address deleted successfully",
            success: true,
        });
    });
}; 

module.exports.setDefaultAddress = async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
        return res.status(400).json({
            err: "User not found"
        });
    }

    const address = await Address.findOne({ _id: req.params.address_id });

    if (!address) {
        return res.status(400).json({
            err: "Address not found"
        });
    }

    const defaultAddress = await Address.find({ 
        user_id: req.userId,
        is_default: true, 
    });

    if (defaultAddress) {
        defaultAddress.is_default = false;
        await defaultAddress.save((err) => {
            if (err) {
                return res.status(400).json({
                    err: "NOT able to save address details in DB"
                });
            }
        });
    }
    
    address.is_default = true;
    
    address.save((err) => {
        if (err) {
            return res.status(400).json({
                err: "NOT able to save address in DB"
            });
        }
        return res.json({
            message: "Address details updated successfully",
            success: true,
        });
    });
};
