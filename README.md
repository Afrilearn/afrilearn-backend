# afrilearn-backend
Afrilearn is an education technology corporation leveraging seasoned teachers, animators and developers to deliver affordable, world-class education for Africans, anywhere.

[![](https://img.shields.io/badge/Protected_by-Hound-a873d1.svg)](https://houndci.com)  [![Build Status](https://travis-ci.org/Afrilearn/afrilearn-backend.svg?branch=develop)](https://travis-ci.org/Afrilearn/afrilearn-backend)  [![Coverage Status](https://coveralls.io/repos/github/Afrilearn/afrilearn-backend/badge.svg)](https://coveralls.io/github/Afrilearn/afrilearn-backend)

## Required Features

- User can create account
- User can activate account through email
- User can login
- User can login through google and facebook
- User can reset password
- User can change password
- User (Student) can see the list of available courses
- User (Student) can select a particular course and have access to all the subjects of that course
- User (Student) can see his progress in the courses he is taking(store and see progress)
- User (Student) can see suggestions of other content to view based on the recent contents he viewed
- User (Student) should be able to add new course
- User(student) should be able to pay for his course
- User(student) should be able to join a class
- User (Teacher) can see the list of available courses
- User (Teacher) can select the courses he is teaching
- User (Teacher) can create a class
- User (Teacher) will have a unique code for each of his class
- User (Teacher) can invite students to be part of his class by sharing his class link
- User (Teacher) can see the list of his students per class
- User (Teacher) can approve a student to be part of his class
- User (Teacher) can remove a student from his class
- User (Teacher) can see the strength/weakness of his students
- User can see video lessons with control buttons like pause, play...
- User can see the text summary attached to a video
- User can see the practice questions/past questions attached to a video
- User (authenticated) can see test attached to a course
- User (authenticated) can see video lessons related to the questions you failed in the test
- and others


## Technologies

- Node JS
- Express
- Mocha & Chai
- ESLint
- ESM
- Travis CI
- Coveralls


## Requirements and Installation

To install and run this project you would need to have installed:
- Node Js
- Git

To run:
```
$ git clone https://github.com/Afrilearn/afrilearn-backend.git
$ cd afrilearn-backend
$ npm install
$ npm run dev
```

## Testing
```
$ npm test
```

## Pivotal Tracker stories

None

## Template UI

None

## API

The API is currently in version 1 (v1) and can be accessed locally via [http://localhost:5000/api/v1](http://localhost:5000/api/vi)

## API Documentation Link

The API documentation is at [https://docs.google.com/document/d/12wec7IcYLgm2_aOkW6wGmrZTJfDm7drYPtYQAdWy9cU/edit](https://docs.google.com/document/d/12wec7IcYLgm2_aOkW6wGmrZTJfDm7drYPtYQAdWy9cU/edit)

## API Endpoints

| Endpoint                                         | Functionality                            |
| ------------------------------------------------ | -----------------------------------------|
| POST /baseURL/auth/signup           | Create a user                           |
| POST /baseURL/auth/activate_account?token=324234   | Activate user account                            |
| POST /baseURL/auth/login   | Login a user                            |
| POST /baseURL/auth/social_login/google   | Social Login through google                            |
| GET/baseURL/auth/<:user-email>/reset_password   | Reset Password                          |
| GET/baseURL/auth/<:token>/verify_password_reset_token    | Verify Password Reset Token                            |
| POST/baseURL/auth/change_password   | Change Password                            |
| GET /baseURL/courses/   | Get courses                           |
| GET /baseURL/courses/:courseId/subjects/   | Get subjects for a course                           |
| POST  /baseURL/courses/add-course   | Add a course                            |
| GET /baseURL/users/:userId/enrolled-courses   | Get list of Enrolled courses and progress                           |
| GET /baseURL/users/:userId/suggested-contents   | See user’s suggested courses                           |
| POST /baseURL/classes/add-class   | User(teacher) can add class                           |
| POST /baseURL/classes/send-class-request   | User(student) Request to join class                           |
| PATCH /baseURL/classes/accept-reject-class-request   | User(teacher) accept/reject join class request                           |
| POST /baseURL/class/remove-class-attendee   | User(teacher) remove class attendee                            |
    

## Author

Okwuosa Chijioke (Okwuosachijioke@gmail.com) and Ayobami Usman(ayobamiu@gmail.com)

## License

This is licensed for your use, modification and distribution under the [MIT license.](https://opensource.org/licenses/MIT)

## My Env Variables
NODE_ENV
PORT
SEND_GRID_API
ATLAS_URL
SECRET
GOOGLE_CLIENT_ID
