# TechTalent API Spec

---

#### Skill

```source-json
  {
    "id": string,
    "skill": string,
    "level": "beginner|intermediate|advanced",
    "verificationStatus": "verified|inProgress|unverified"
  }
```

#### Course

```source-json
{
  "id": string,
  "name": string,
  "languageTaught": string,
  "instructor": string,
  "currentLangSpecsUpdated": boolean,
  "existingCourseLink": string,
  "coverImageLink": string,
  "verificationStatus: "accepted|pending|declined"
}
```

#### Users

- **Talent**

```source-json
  {
    "user": {
      "role": "talent",
      "featureChoice": "premium",
      "paymentStatus": "unpaid|failed|confirmed",
      "profileStatus": "draft|pusblished",
      "verified": boolean,
      "firstName": "John",
      "lastName": "Smith",
      "email": "jsmith@email.com",
      "currentRole": {
        "value": "Senior Software Engineer",
        "startDate": "12-25-2018",
        "endDate": "10-12-2020"
      },
      "skills": [
        {<skill_object>},
        {<skill_object>},
        {<skill_object>}
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
      "role": "education",
      "paymentStatus": "unpaid|failed|confirmed",
      "schoolName": "Hack Reactor Texas",
      "address": "123 Main Street, New York, NY 10030",
      "website": "hackreactor.com",
      "schoolCode": "HR500",
      "verified": boolean,
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

- **Training Affiliate**

```source-json
  {
    "user": {
      "role": "training",
      "paymentStatus": "unpaid|failed|confirmed",
      "name": "Hack Reactor Texas",
      "address": "123 Main Street, New York, NY 10030",
      "website": "hackreactor.com",
      "verified": boolean,
      "affiliateContact": {
        "name": "John Doe",
        "email": "johndoe@email.com",
        "phone": "001994545"
      },
      "courses": [{<course_object>}, {<course_object>}, {<course_object>}]
    }
  }
```

- **HR/Staffing/Recruiter**

```source-json
  {
    "user": {
      "role": "hr-staffing-recruiter",
      "paymentStatus": "unpaid|failed|confirmed",
      "companyName": "Hack Reactor Texas",
      "address": "123 Main Street, New York, NY 10030",
      "website": "hackreactor.com",
      "companyCode": "HR500",
      "verified": boolean,
      "manager": {
        "name": "John Doe",
        "email": "johndoe@email.com",
        "phone": "001994545"
      },
      "subsidizedStaff": {
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

##### `POST /api/auth/login`

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
        "error": "You have one or more invalid credentials"
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

##### `POST /api/auth/register`

- **Data Params**

```source-json
  {
    "email": string,
    "password": string,
    "role": string,
    ...
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

#### Get users by role

1. `GET /api/users/talent`

2. `GET /api/users/education`

3. `GET /api/users/training`

4. `GET /api/users/business`

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Success Response**

  - Code: `200`
  - Content:
    ```source-json
      {
        "data": [
          {<user_object>},
          {<user_object>},
          {<user_object>}
        ]
      }
    ```

- **Error Response**
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```

#### Get current user

Get the currently logged in user

##### `GET /api/user`

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Success Response**

  - Code: `200`
  - Content:
    ```source-json
      {
        "profile": {<user_object>},
      }
    ```

- **Error Response**
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```

#### Get a specific user

Get a user by id

##### `GET /api/users/:id`

- **URL Params**
  Required: `id=[string]`

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Success Response**

  - Code: `200`
  - Content:
    ```source-json
      {
        "profile": {<user_object>},
      }
    ```

- **Error Response**
  - Code: `404`
  - Content:
    ```source-json
      {
        "message": "User not found"
      }
    ```
    OR
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```

#### Update fields a specific user

Updates fields on the specified user and returns the updated object

##### `PATCH /api/users/:id`

- **URL Params**
  Required: `id=[string]`

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Data Params**

```source-json
  {
    "email": string,
    ...
  }
```

- **Success Response**

  - Code: `200`
  - Content:
    ```source-json
      {
        "profile": {<user_object>},
      }
    ```

- **Error Response**
  - Code: `404`
  - Content:
    ```source-json
      {
        "message": "User not found"
      }
    ```
    OR
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```

#### Delete a specific user

Updates fields on the specified user and returns the updated object

##### `DELETE /api/users/:id`

- **URL Params**
  Required: `id=[string]`

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Success Response**

  - Code: `204`
  - Content: No Content

- **Error Response**
  - Code: `404`
  - Content:
    ```source-json
      {
        "message": "User not found"
      }
    ```
    OR
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```

#### Get talent based on skills

Fetch list of users matching given skill(s)

##### `GET /api/users/talent?skills=id,id`

- **URL Query**
  Required: `id=[string]` (at least one)

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Success Response**

  - Code: `200`
  - Content:
    ```source-json
      {
        "data": [
          {<user_object>},
          {<user_object>},
          {<user_object>}
        ]
      }
    ```

- **Error Response**
  - Code: `404`
  - Content:
    ```source-json
      {
        "message": "No users found"
      }
    ```
    OR
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```

#### Get talent based on subscription

Fetch list of users matching given skill(s)

##### `GET /api/users/talent?subcription=premium|standard|basic`

- **URL Query**
  Required: `subscription=[string]`

- **Headers**
  Content-Type: application/json
  Authorization: Bearer `<Token>`

- **Success Response**

  - Code: `200`
  - Content:
    ```source-json
      {
        "data": [
          {<user_object>},
          {<user_object>},
          {<user_object>}
        ]
      }
    ```

- **Error Response**
  - Code: `404`
  - Content:
    ```source-json
      {
        "message": "No users found"
      }
    ```
    OR
  - Code: `401`
  - Content:
    ```source-json
      {
        "error": "You are unauthorised to make this request"
      }
    ```
