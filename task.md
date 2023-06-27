# Vartotojų API - CRUD

-   git/Github/readme (1pt)
    -   git - kiekvienas prasmingas pakeitimas atskirame commit'e;
    -   readme - su pavyzdžiais kaip naudotis jūsų API ir kartu pateikti pavyzdinius gražinamus rezultatus;
-   nuorodos struktūra `/api/user` (1pt);
-   visos kitos nuorodos gražina `404` (1pt);
-   sukurti elementą `POST: /api/user` (1pt);
    -   kuriant elementą pridėti įrašymo datą ir unikalų ID (1pt);
    -   JSON išsaugoti kaip failą;
-   gauti elemento informaciją `GET: /api/user/[ID]` (1pt);
    -   password negalima gražinti;
-   gauti elemento informaciją `GET: /api/user-by-email/[EMAIL]` (1pt);
    -   password negalima gražinti;
-   atnaujinti elementą `PUT: /api/user` (1pt);
-   atnaujinti elementą `PUT: /api/user-email` (1pt);
-   ištrinti elementą `DELETE: /api/user/[ID]` (1pt);

## How to use

> **POST: /api/user**

Request object:

```json
{
    "name": "Jonas",
    "email": "jonas@jonas.lt",
    "password": "superseacretpassword",
    "age": 99
}
```

Response object, if all goes well:

```json
{
    "status": true,
    "message": "User created"
}
```

Response object, if any error:

```json
{
    "status": false,
    "message": "User already exists, dublicate email"
}
```

> **GET: /api/user/[ID]**

Response object:

-   excluding password;

```json
{
    "id": 3,
    "name": "Jonas",
    "email": "jonas@jonas.lt",
    "created-at": "2023-06-26 9:16:43"
}
```