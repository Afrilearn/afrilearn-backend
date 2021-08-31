import ChallengeModel from "../db/models/challenge.model";
import ChallengeResult from "../db/models/challengeResult.model";
import sendEmail from "../utils/email.utils";

export default {
  async createNewChallenges() {
    try {
      // summarize last challenge
      await this.summarizeLastChallenge();
      //create new challenge
      //Jss1    
      await ChallengeModel.create({ 
        name:'J1 Combat',
        creatorId:'603fdf31a36c060015655272',
        courseId:'5fff72b3de0bdb47f826feaf',
        examblyPastQuestionExamId:9,
        numberOfQuestions:0,
        timeSpan:5,
        entryFee:100,
        prize:'₦5000 Cash Reward',
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
        prize:'₦5000 Cash Reward',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundjss2.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Basic Science',
        challengeTypeId:'611a6e1343ceb054480c5538'  
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
        prize:'₦5000 Cash Reward',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundjss3.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Basic Science',
        challengeTypeId:'611a6e1343ceb054480c5538'    
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
        prize:'₦5000 Cash Reward',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundss1.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Biology',
        challengeTypeId:'611a6e1343ceb054480c5538'    
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
        prize:'₦5000 Cash Reward',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundss2.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Biology',
        challengeTypeId:'611a6e1343ceb054480c5538'    
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
        prize:'₦5000 Cash Reward',
        challengeImageUrl:'https://afrilearn-media.s3.eu-west-3.amazonaws.com/challenge/Backgroundss3.png',
        description:'Brace Yourself for Battle!',
        subjects:'Mathematics, English and Biology',
        challengeTypeId:'611a6e1343ceb054480c5538'    
      }); 
      console.log('Done creating challenge')
    } catch (err) {
      console.log(err)
    }
  },

  async summarizeLastChallenge() {
    try {      
      let overallWinners =''
      // get recentChallenges
      let challenges = await ChallengeModel.find({
        challengeTypeId: '611a6e1343ceb054480c5538'
      }).sort({
        createdAt: -1,
      }).select('name createdAt').limit(6)

      // get the challenge results
      if (challenges.length) {
        let challengesLength = challenges.length;
        for (let i = 0; i < challengesLength; i++) {
          let challengeResults = await ChallengeResult.find({
            challengeId: challenges[i].id
          }).sort({
            winRatio: -1,
          }).select('winRatio')
            .populate({
              path: "userId",
              select: "fullName email bank accountNumber accountName",
            }).populate({
              path: "challengeId",
              select: "name",
            });;

          // send them emails
          if (challengeResults.length) {
            let challengeResultsLength = challengeResults.length;
            for (let index = 0; index < challengeResultsLength; index++) {              
              if (index === 0) {
                //send the winner a message and store his data in the winners array           
                let winnerMessageTitle = `Congratulations! You're the Winner of the #AfrilearnChallenge ${challengeResults[index].challengeId.name} 💃`;
                let winnerMessage = `Dear ${challengeResults[index].userId?challengeResults[index].userId.fullName:'Unknown'},<br/><br/>
                Congratulations! We are thrilled to inform you that after competing intellectually with hundreds of brilliant learners from across Nigeria on Afrilearn this week, you have emerged Overall Winner of the highly competitive #AfrilearnChallenge ${challengeResults[index].challengeId.name}! 🤩<br/><br/>
                As the Winner of the coveted #AfrilearnChallenge, you have officially joined the league of extraordinary learners and qualified for the following rewards👌<br/><br/>
                1.  You will be celebrated across our social media platforms as an Afrilearn Laureate. <br/>
                2.  Your Headshot, Bio and Success Story interview will be featured on our website alongside that of previous Champions.<br/>
                3.  The cash prize of ₦5000 will be credited into your Bank Account<br/><br/><br/>     
                To claim your rewards, we’d love to have a Brief Virtual Chat with you soon; a member of our team will reach out to schedule a convenient time. In the meantime, kindly answer the few questions below and attach a Favourite Photo you would like to be used to Celebrate You:<br/><br/>
                Full Name:<br/>
                Age:<br/>
                Location:<br/>
                Class:<br/>
                School:<br/>
                Contact No:<br/><br/><br/>
                Once again, Congratulations Champ! Keep learning and cultivating your genius. You will succeed! ✨<br/><br/>
                To your Success,<br/>
                Team Afrilearn
                `
                overallWinners+=`${challengeResults[index].challengeId.name} was won by ${challengeResults[index].userId?challengeResults[index].userId.fullName:'Unknown'} with a total score of ${challengeResults[index].winRatio}.<br/>
                Bank: ${challengeResults[index].userId.bank?challengeResults[index].userId.bank:'unknown'};<br/>
                Account Name: ${challengeResults[index].userId.accountName?challengeResults[index].userId.accountName:'unknown'};<br/>
                Account Number: ${challengeResults[index].userId.accountNumber?challengeResults[index].userId.accountNumber:'unknown'};<br/><br/><br/>`;
                sendEmail(challengeResults[index].userId.email, winnerMessageTitle, winnerMessage);
              } else {                
                //send message to the other participants 
                let contestantsMessageTitle = `UPDATE: Your #AfrilearnChallenge ${challengeResults[index].challengeId.name} Competition`;
                let contestantsMessage = `Dear ${challengeResults[index].userId?challengeResults[index].userId.fullName:'Unknown'},<br/><br/>
                Kudos for taking the time to participate in the awesome ${challengeResults[index].challengeId.name}.  We heartily commend your brilliant attempt! 🙌<br/><br/>
                While you did not make the Finalist round at this time, you should be super proud of your increasing mental prowess and stellar performance as you ranked *${index + 1}* out of *${challengeResultsLength}* contestants!
                This is a testament to your unlimited brainpower and potentials.💪<br/><br/>
                Therefore, we strongly encourage you to enter the next #AfrilearnChallenge for another chance as you unleash your genius, win the coveted Cash Prize, and become a widely celebrated Afrilearn Laureate.<br/>
                In the meantime, share your feedback <a href="https://forms.gle/DL91wCdxUtjj1p8K7" target="_blank">HERE</a> and watch this space for the announcement of the Winner!
                <br/><br/>
                To your Success,<br/>
                Team Afrilearn 
                `; 
                sendEmail(challengeResults[index].userId.email, contestantsMessageTitle, contestantsMessage);
              }
            }
          }
        }
      
        sendEmail('hello@myafrilearn.com', 'Africhallenge Results', overallWinners);
      }

      console.log('Done Processing Last Africhallenge')
    } catch (err) {
      console.log(err)
    }
  }
};