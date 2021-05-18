import {
    Router
} from 'express';
import ThirdPartyController from "../controllers/thirdParty.controller";
import validateUser from "../middlewares/thirdParty.middleware";

const router = Router();

router.get(
    "/get-juniour-secondary-school-classes-subjects",
    validateUser,
    ThirdPartyController.getJuniourSecondarySchoolClassSubjects
);

router.get(
    '/:subjectId/getSubjectLesson',
    validateUser,
    ThirdPartyController.getSubjectLessons
);
export default router; 