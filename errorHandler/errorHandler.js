const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    // Respond with a generic error message
    res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal Server Error",
        },
    });
};

export default errorHandler;