import LessonComment from "../db/models/lessonComments.model";
import LessonCommentReplies from "../db/models/lessonCommentsReplies.model";

/**
 *Contains Comment Controller
 *
 *
 *
 * @class CommentController
 */
class CommentController {
    /**
     * Add a comment
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof CommentController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async addLessonComment(req, res) {
        try {
            let comment = await LessonComment.create(req.body)
            comment = await LessonComment.findById(comment.id).populate({
                    path: "userId",
                    select: "fullName profilePhotoUrl"
                })
                .populate({
                    path: "commentReplies",
                    model: LessonCommentReplies
                })
            return res.status(200).json({
                status: "success",
                data: {
                    comment
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error adding lesson comment",
            });
        }
    }


    /**
     * liked comment
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof CommentController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async likeLessonComment(req, res) {
        try {
            const {
                userId,
                lessonCommentId
            } = req.body;

            let DComment = await LessonComment.findById(lessonCommentId);
            DComment.likes = DComment.likes.slice(); // Clone the tags array
            DComment.likes.push(userId);
            await DComment.save();

            let selectedComment = await LessonComment.findById(lessonCommentId).populate({
                    path: "userId",
                    select: "fullName profilePhotoUrl"
                })
                .populate({
                    path: "commentReplies",
                    model: LessonCommentReplies
                })
            return res.status(200).json({
                status: "success",
                data: {
                    selectedComment
                }
            });
        } catch (error) {
            //console.log(error)
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error saving lesson comment like",
            });
        }
    }

    /**
     * unlike comment
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof CommentController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async unLikeLessonComment(req, res) {
        try {
            const {
                userId,
                lessonCommentId
            } = req.body;

            let selectedComment = await LessonComment.findById(lessonCommentId);
            selectedComment.likes = selectedComment.likes.slice(); // Clone the tags array
            selectedComment.likes.pull(userId);
            selectedComment.save();

            return res.status(200).json({
                status: "success",
                data: {
                    selectedComment
                }
            });
        } catch (error) {
            //console.log(error)
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error removing lesson comment like",
            });
        }
    }

    /**
     * get lesson comments
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof CommentController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async getLessonComments(req, res) {
        try {
            const comments = await LessonComment.find({
                    lessonId: req.params.lessonId,
                    commentSection: req.body.commentSection
                }).sort({
                    createdAt: -1
                })
                .limit(30).populate({
                    path: "userId",
                    select: "fullName profilePhotoUrl"
                })
                .populate({
                    path: "commentReplies",
                    model: LessonCommentReplies,
                    populate: {
                        path: "userId",
                        select: "fullName profilePhotoUrl"
                    }
                })
            return res.status(200).json({
                status: "success",
                data: {
                    comments
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error getting lesson comment",
            });
        }
    }

    /**
     * Add a comment reply
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof CommentController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async addLessonCommentReply(req, res) {
        try {
            let commentReply = await LessonCommentReplies.create(req.body)
            commentReply = await LessonCommentReplies.findById(commentReply.id).populate({
                path: "userId",
                select: "fullName profilePhotoUrl"
            })
            return res.status(200).json({
                status: "success",
                data: {
                    commentReply
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error adding lesson comment reply",
            });
        }
    }

    /**
     * Delete a lesson comment
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof LessonController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async deleteLessonComment(req, res) {
        try {
            await LessonComment.findOneAndDelete({
                _id: req.params.lessonCommentId
            });
            await LessonCommentReplies.deleteMany({
                lessonCommentId: req.params.lessonCommentId
            });
            return res.status(200).json({
                status: "success",
                data: {
                    message: 'Data delected successfully'
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error deleting lesson comment",
            });
        }
    }

    /**
     * update a lesson comment
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof LessonController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async updateLessonComment(req, res) {
        try {            
            let comment = await LessonComment.findOneAndUpdate({
                _id: req.params.lessonCommentId
            }, {
                text: req.body.text,
            }, {
                new: true,
            });
            comment = await LessonComment.findById(comment.id).populate({
                path: "userId",
                select: "fullName profilePhotoUrl"
            })
            .populate({
                path: "commentReplies",
                model: LessonCommentReplies
            })
            return res.status(200).json({
                status: "success",
                data: {
                    comment
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error updating lesson comment",
            });
        }
    }

}
export default CommentController;