# Envelopes API

You can access the API at: (https://personal-budget-2-8zoz.onrender.com/envelopes)

**Envelopes API** is a budgeting management system that uses virtual envelopes to organize expenses. It allows you to create, view, update, and delete budget envelopes. Each envelope represents a specific spending category, like **Rent**, **Groceries**, **Transport**.

The API is connected to the postgreSQL database in Render.

## Features

- Creating Budget Envelopes
- Retrieving Envelope Details
- Updating Envelope Balances
- Deleting Envelopes
- Creating Transaction History


# Retrieving all envelopes
GET /envelopes

Response:

![image](https://github.com/user-attachments/assets/6d8addd9-0bd5-44b5-bcc9-7cdf3e53b406)



# Retrieving envelope by id
GET /envelope/{id}

Response:

![image](https://github.com/user-attachments/assets/951a2481-a3f3-4959-acfc-aa4ff88553fe)

# Retrieving transactions history
GET /envelopes/transactions

Response:

![image](https://github.com/user-attachments/assets/7eef0670-6e53-4c9a-9d4a-0faabbeb4f9e)


# Retrieving transactions history by id
GET /envelopes/transactions/{id}

Response:

![image](https://github.com/user-attachments/assets/0ac78538-f916-4600-8fc4-1ff9acd5cbf4)

# Creating an envelope for house expenses
POST /envelopes:

![image](https://github.com/user-attachments/assets/53f7f9bd-a834-4f1d-89b5-7bab665bae92)

# Updating envelope balance
PATH /envelopes/operation/{id}

![image](https://github.com/user-attachments/assets/bc032d7d-9c9f-416f-8541-db8a4e107b5b)
![image](https://github.com/user-attachments/assets/a9d0585b-277d-448a-a81a-d8dfa78ba2e5)
![image](https://github.com/user-attachments/assets/635d1fa6-749c-4ff0-a7ae-dea928c98dad)

# Transaction between envelopes
POST /envelopes/transfer

![image](https://github.com/user-attachments/assets/d0e79d2b-341f-4bd6-8817-5c102e720223)

Result:


![image](https://github.com/user-attachments/assets/0173cebf-4cc6-44f4-bf85-ee29b112a93f)



