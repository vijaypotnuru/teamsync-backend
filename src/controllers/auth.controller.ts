import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Request in login", req.body);
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          console.log("Passport error in login", err);
          return next(err);
        }

        if (!user) {
          console.log("User not found", user);
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            console.log("req.logIn error", user, err);
            return next(err);
          }

          console.log("Login successful, session established", req.session);
          console.log("Is authenticated after login:", req.isAuthenticated());

          return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            user,
            sessionInfo: req.session ? { id: req.session.id } : null,
            authenticated: req.isAuthenticated(),
          });
        });
      }
    )(req, res, next);
  }
);

export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Logout request received, session before logout:", req.session);
    console.log("Is authenticated before logout:", req.isAuthenticated());

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to log out" });
      }

      console.log("User logged out successfully");
      console.log("Is authenticated after logout:", req.isAuthenticated());

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });

      return res.status(HTTPSTATUS.OK).json({
        message: "Logged out successfully",
        authenticated: req.isAuthenticated(),
      });
    });
  }
);

export const sessionCheckController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Session check:", req.isAuthenticated(), req.user);
    if (req.isAuthenticated()) {
      return res.status(HTTPSTATUS.OK).json({
        authenticated: true,
        user: req.user,
      });
    }
    return res.status(HTTPSTATUS.UNAUTHORIZED).json({
      authenticated: false,
    });
  }
);
