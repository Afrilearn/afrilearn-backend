import ChallengeModel from "../db/models/challenge.model";

export default {
  async createNewChallenges() {
    try { 
      //Jss1    
      await ChallengeModel.create({ 
        name:'J1 Combat',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff72b3de0bdb47f826feaf',
        examblyPastQuestionExamId:9,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'N5000',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundjss1.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Basic Science'  
      }); 
      //Jss2
      await ChallengeModel.create({ 
        name:'J2 Clash',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff7329de0bdb47f826feb0',
        examblyPastQuestionExamId:10,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'N5000',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundjss2.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Basic Science'  
      }); 
      //Jss3
      await ChallengeModel.create({ 
        name:'J3 Champ',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff734ade0bdb47f826feb1',
        examblyPastQuestionExamId:11,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'N5000',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundjss3.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Basic Science'  
      }); 
      //ss1
       await ChallengeModel.create({ 
        name:'S1 Sprint',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff7371de0bdb47f826feb2',
        examblyPastQuestionExamId:12,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'N5000',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundss1.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Biology'  
      }); 
       //ss2
       await ChallengeModel.create({ 
        name:'S2 Whiz',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff7380de0bdb47f826feb3',
        examblyPastQuestionExamId:13,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'N5000',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundss2.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Biology'  
      }); 
      //ss3
       await ChallengeModel.create({ 
        name:'S3 Hero',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff7399de0bdb47f826feb4',
        examblyPastQuestionExamId:14,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'N5000',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundss3.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Biology'  
      }); 
      console.log('Done creating challenge')
    } catch (err) {
       console.log(err)
    }
  }
};