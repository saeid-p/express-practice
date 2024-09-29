export const wrapErrors = (action) => async (req, res, next) => {
  try {
    await action(req, res, next);
  } catch (error) {
    console.log("Error!", error);
    next(error);
  }
};
