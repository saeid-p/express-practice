import UserModel from "../db/userStore.js";
import { wrapErrors } from "./controller.utils.js";

const getOneOrAll = async (req, res) => {
  const { userId } = req.params;
  if (userId) {
    const key = Number.parseInt(userId);
    const item = await UserModel.findById(key);
    return item ? res.status(200).json(item) : res.status(204);
  }

  const items = await UserModel.find({});
  return res.status(200).json(items);
};

const addOne = async (req, res) => {
  const user = req.body;
  await UserModel.create({ ...user });
  return res.status(200).json(user);
};

const updateOne = async (req, res) => {
  const user = req.body;
  await UserModel.updateOne({ ...user });
  return res.status(200).json(user);
};

const deleteById = async (req, res) => {
  await UserModel.deleteById(req.params.userId);
  return res.status(200);
};

const searchByDisplayName = async (req, res) => {
  const { displayName } = req.query;
  const query = {
    displayName: displayName,
  };
  return res.json(await UserModel.find(query));
};

const BASE_ROUTE = "/users";
export default (app) => {
  app.get(BASE_ROUTE, wrapErrors(getOneOrAll));
  app.get(`${BASE_ROUTE}/:userId`, wrapErrors(getOneOrAll));
  app.post(BASE_ROUTE, wrapErrors(addOne));
  app.put(BASE_ROUTE, wrapErrors(updateOne));
  app.delete(BASE_ROUTE, wrapErrors(deleteById));
  app.get(`${BASE_ROUTE}/search`, wrapErrors(searchByDisplayName));
};
