HERE, I WILL WRITE ALL THE FAILURES I FACE THROUGHOUT THE PROJECT - may and may not be in order

### **`ENUM handle in DB`**

When I was testing signup and login method, I notice one thing that in db the role - User Role has datatype of smallInt,
and it was written 0 - actually It was ordinal, CUSTOMER - 0, ADMIN - 2 ...

So, it was a major problem, then I find out about an annotation - `@Enumerated(EnumType.STRING)`

Actually it is used for enums in db, So db can treat them as provided - datatype

