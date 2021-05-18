
// eslint-disable-next-line consistent-return
const validateUser = (req, res, next) => {

    const { token } = req.headers;
  
    if (!token) {
      return res.status(401).json({
        status: '401 Unauthorized',
        error: 'Access token is Required',
      });
    }
    if(token !== '5f90a7d453b484eb1556d152c5'){
      return res.status(401).json({
          status: '401 Unauthorized',
          error: 'Access token is invalid',
        });
    }else{
      return next();
    } 
  };
  export default validateUser;
  