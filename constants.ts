export const ERROR_MESSAGES = {
  NO_TOKEN_PROVIDED: "No token provided",
  INVALID_GOOGLE_TOKEN: "Invalid Google token",
  USER_UPDATE_FAILED: "User update failed",
  USER_CREATION_FAILED: "User creation failed",
  LOGIN_FAILED: "Login failed",
  USER_NOT_FOUND: "User not found",
  INVALID_TOKEN: "Invalid token"
};

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  OK: 200
};


export const corsOptions = {
  origin: ['http://localhost:3000', 'https://www.fluto.life', 'http://localhost:3001'],
  credentials: true,
};

export const JWT_CONFIG = {
  expiresIn: "7d"
};

  export const POST =3001;
  
  export const TOKEN_REFRESH_THRESHOLD = 86400; // 1 day in seconds
  // export const ERROR_MESSAGES = {
  //   NO_TOKEN_PROVIDED: "No token provided",
  //   INVALID_GOOGLE_TOKEN: "Invalid Google token",
  //   USER_UPDATE_FAILED: "User update failed",
  //   USER_CREATION_FAILED: "User creation failed",
  //   LOGIN_FAILED: "Login failed",
  //   USER_NOT_FOUND: "User not found",
  //   INVALID_TOKEN: "Invalid token"
  // };

  
  
  // export const HTTP_STATUS = {
  //   BAD_REQUEST: 400,
  //   UNAUTHORIZED: 401,
  //   NOT_FOUND: 404,
  //   INTERNAL_SERVER_ERROR: 500,
  //   OK: 200
  // };
  export const SERVER_START_MESSAGE = `
    🚀 Blast off! Your stellar server has launched! 🌟
    
         !
         !
         ^
        / \\
       /___\\
      |=   =|
      |     |
      |     |
      |     |
      |     |
      |     |
    /|##!##|\\
    / |##!##| \\
   /  |##!##|  \\
  |  / ^ | ^ \\  |
  | /  ( | )  \\ |
  |/   ( | )   \\|
      ((   ))
     ((  :  ))
     ((  :  ))
      ((   ))
       (( ))
        ( )
         .
         .
         .
  
    🌍 Mission Control: http://localhost:3001
    👩‍🚀 Ready for your commands, Captain!
    `;