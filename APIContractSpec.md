# TechTalent API Spec

---

#### Users

- **Talent**

```source-json
  {
    "user": {
      "type": "talent",
      "featureChoice": "premium",
      "paymentStatus": "unpaid|failed|confirmed",
      "profileStatus": "draft|pusblished",
      "verified": false,
      "firstName": "John",
      "lastName": "Smith",
      "email": "jsmith@email.com",
      "currentRole": {
        "value": "Senior Software Engineer",
        "startDate": "12-25-2018",
        "endDate": "10-12-2020"
      },
      "skills": [
        {
          "skill": "Angular",
          "level": "beginner|intermediate|advanced",
          "verificationStatus": "verified|inProgress|unverified"
        },
        {
          "skill": "Python",
          "level": "beginner|intermediate|advanced",
          "verificationStatus": "verified|inProgress|unverified"
        },
        {
          "skill": "Angular",
          "level": "beginner|intermediate|advanced",
          "verificationStatus": "verified|inProgress|unverified"
        }
      ],
      "employmentHistory": [
        {
          "companyName": "Twitter, Inc",
          "supervisor": "Jack Dorsey",
          "title": "Chief Technical Officer",
          "startDate": "25-12-2018",
          "endDate": "12-10-2020",
          "skillsUsed": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          "responsibilities": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
          "accomplishments": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
          "favoriteProject": "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          "verificationStatus": "verified|inProgress|unverified"
        }
      ],
      "educationHistory": [
        {
          "schoolName": "Hack Reactor",
          "level": "Technical Bootcamp",
          "degreeOrCertification": "Fullstack Developer",
          "specializations": ["Backend Infrastructure"],
          "startDate": "25-12-2018",
          "endDate": "12-10-2020",
          "accomplishments": "Graduated top of class",
          "verificationStatus": "verified|inProgress|unverified"
        }
      ]
    }
  }
```

- **Education**

```source-json
  {
    "user": {
      "type": "education",
      "paymentStatus": "unpaid|failed|confirmed",
      "schoolName": "Hack Reactor Texas",
      "address": "123 Main Street, New York, NY 10030",
      "website": "hackreactor.com",
      "schoolCode": "HR500",
      "verified": false,
      "manager": {
        "name": "John Doe",
        "email": "johndoe@email.com",
        "phone": "001994545"
      },
      "subsidizedStudents": {
        "number": 500,
        "term": "monthly|annualy",
        "termTotal": "$$$$",
      }
    }
  }
```

- **Training**

```source-json
  {
    "user": {
      "type": "training",
      "paymentStatus": "unpaid|failed|confirmed",
      "schoolName": "Hack Reactor Texas",
      "address": "123 Main Street, New York, NY 10030",
      "website": "hackreactor.com",
      "schoolCode": "HR500",
      "verified": false,
      "manager": {
        "name": "John Doe",
        "email": "johndoe@email.com",
        "phone": "001994545"
      },
      "subsidizedStudents": {
        "number": 500,
        "term": "monthly|annualy",
        "termTotal": "$$$$",
      }
    }
  }
```

- **HR/Staffing/Recruiter**

```source-json
  {
    "user": {
      "type": "hr-staffing-recruiter",
      "paymentStatus": "unpaid|failed|confirmed",
      "schoolName": "Hack Reactor Texas",
      "address": "123 Main Street, New York, NY 10030",
      "website": "hackreactor.com",
      "schoolCode": "HR500",
      "verified": false,
      "manager": {
        "name": "John Doe",
        "email": "johndoe@email.com",
        "phone": "001994545"
      },
      "subsidizedStudents": {
        "number": 500,
        "term": "monthly|annualy",
        "termTotal": "$$$$",
      }
    }
  }
```

### Endpoints

#### Authentication

Authenticates user's credentials

##### `POST /auth/login`

- **Data Params**

```source-json
  {
    "username|email": string,
    "password": string"
  }
```

- **Success Response**
  - Code: `200`
  - Content:
    ```source-json
      {
        "profile": {<user_object>},
        "token": string,
        "refresh": string
      }
    ```
- **Error Response**
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorized to make this request."
      }
    ```
    OR
  - Code: `400`
  - Content:
    ```source-json
      {
        "error": "Missing required field(s)"
      }
    ```

#### Registration

Create a user account

##### `POST /auth/register`

- **Data Params**

```source-json
  {
    "email": string,
    "password": string",
    ...{<user_sign_up_data>}
  }
```

- **Success Response**
  - Code: `201`
  - Content:
    ```source-json
      {
        "profile": {<user_object>},
        "token": string,
        "refresh": string
      }
    ```
- **Error Response**
  - Code: `400`
  - Content:
    ```source-json
      {
        "error": "Missing or Invalid required field(s)"
      }
    ```
