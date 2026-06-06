const { renewTokenService } = require("../services");

const renewTokenController = async (req, res) => {

    try {
        const result = await renewTokenService(req.body);
        return res.status(200).json(result);

    } catch (error) {

        return res.status(error.status || 500)
            .json({
                message: "Error al renovar token",
                error: error.message
            });
    }
};

module.exports = renewTokenController;