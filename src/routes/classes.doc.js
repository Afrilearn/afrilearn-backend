const getLessons = {
    tags: ["lessons"],
            description: "List of all the lessons",
            responses: {
                200: {
                    description: "Ok",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                example: {
                                    "status": "success",
                                    "data": {
                                        "lessons": [
                                            {
                                                "likes": [],
                                                "views": 56,
                                                "_id": "6012bdcecfe09249249f7e9c",
                                                "subjectId": {
                                                  "_id": "5fff5bab3fd2d54b08047c82",
                                                  "mainSubjectId": {
                                                    "_id": "60115b97f05815325d1a9dfb",
                                                    "name": "Agricultural Science",
                                                    "id": "60115b97f05815325d1a9dfb"
                                                  },
                                                  "id": "5fff5bab3fd2d54b08047c82"
                                                },
                                                "title": "Drawing And Labeling Of Farm Tools",
                                                "updatedAt": "2022-05-22T17:17:40.413Z",
                                                "createdAt": "2021-08-02T12:52:44.000Z",
                                                "videoUrls": [
                                                  {
                                                    "_id": "61599bbe0d83c53834563589",
                                                    "transcript": "<p>Transcript</p>",
                                                    "videoUrl": "https://youtu.be/St53lTNJyVc"
                                                  },
                                                  {
                                                    "_id": "615b2916edb75e5158c1765a",
                                                    "transcript": "<p>https://youtu.be/X2H1Ilg4RWYhttps://youtu.be/X2H1Ilg4RWY<br></p>",
                                                    "videoUrl": "https://youtu.be/X2H1Ilg4RWY"
                                                  }
                                                ],
                                                "thumbnailUrl": "https://afrilearn-media.s3.eu-west-3.amazonaws.com/video-lessons/1628849061984Agricultural%20sci.png",
                                                "__v": 1,
                                                "id": "6012bdcecfe09249249f7e9c"
                                              }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
}

const classesRouteDoc = {
    "/lessons":{
        get: getLessons,
    }


};

module.exports = classesRouteDoc;




