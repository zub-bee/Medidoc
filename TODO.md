- Include organization profile endpoint to see organization details
- Include organization profile endpoint for specific signed in organization

BUGS (simple fixes)
- remove the role as a required field in verification of OTP. We don't use it anyway
- return the patient profile id of the person when responding to the organization id

ADDITIONS
- Add a validatory to remove html injections

1. auth.service.ts: 144 - OTP should happen to confirm number therefore message should be sent to number. I don't know how to do that yet but I have to do some research. Number is used at the signup point for authentication but is stored in the actual patient database. To change the otp or add another functionality, I'd have to go to otp.services.ts. The otp services function should be such that it can replace with email or number. Once that is sorted, then the number is imported from the Patient Type

2. Add a verification handler for CAC numbers for organizations. Instead of otp by email, again it'll be both that and cac verification

3. Wire up the oauth after auth is settled


ROLE should be determined by the shape of the user data that is inputted. I have to set 
up that one and carry over the role in determining the otp verification.