const { recoverAccountService } = require("../services");

const recoverAccountController = async (req, res) => {

    try {
        const result = await recoverAccountService(req.body);
        return res.status(200).json(result);

    } catch (error) {

        return res.status(error.status || 500)
            .json({
                message: "Error al recuperar cuenta",
                error: error.message
            });
    }
};

module.exports = recoverAccountController;