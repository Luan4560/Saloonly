import { app } from "@/app";

export const parseData = () => {
  app.addHook("preHandler", (req, _, next) => {
    if (req.body && typeof req.body === "object") {
      const transformObject = (obj: any) => {
        for (const key in obj) {
          if (typeof obj[key] === "string") {
            const excludedKeys = [
              "day_of_week",
              "establishment_type",
              "establishmentType",
              "status",
              "role",
              "name",
              "description",
              "address",
              "image",
              "avatar",
            ];
            if (!excludedKeys.includes(key) && obj[key].length >= 1) {
              obj[key] = obj[key].charAt(0).toLowerCase() + obj[key].slice(1);
            }
          } else if (typeof obj[key] === "object" && obj[key] !== null) {
            transformObject(obj[key]);
          }
        }
      };
      transformObject(req.body);
    }
    return next();
  });
};
