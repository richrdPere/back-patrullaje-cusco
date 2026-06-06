const { resetPasswordService } = require("../services");

const resetPasswordController = async (req, res) => {

    try {
        const result = await resetPasswordService(req.body);
        return res.status(200).json(result);

    } catch (error) {

        return res.status(error.status || 500)
            .json({
                message: "Error al restablecer contraseña",
                error: error.message
            });
    }
};

module.exports = resetPasswordController;