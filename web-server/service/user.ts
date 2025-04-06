import { User } from "@/models/users";
import userModel from "@/models/users";


export const regist = async (email: string): Promise<User | undefined> => {
  let user: User | null = await userModel.findOne({
    where: {
      email: email,
    },
  });
  console.log("user", user);

  if (!user) {
    user = await userModel.create({
      name: email,
      email: email,
      registrationDate: new Date(),
    });
  }
  return user;
};

export const findOrCreateUserByGoogleEmail = async (email: string, image: string) => {
  let user: User | null = await userModel.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    user = await userModel.create({
      name: email,
      email: email,
      image,
      registrationDate: new Date(),
    });
  }
  return user;
}