import {
    Router
} from 'express';
import ThirdPartyController from "../controllers/thirdParty.controller";

const router = Router();

router.get(
    "/get-juniour-secondary-school-classes-subjects",
    ThirdPartyController.getJuniourSecondarySchoolClassSubjects
);

router.get(
    '/:subjectId/getSubjectLesson',
    ThirdPartyController.getSubjectLessons
);
export default router;