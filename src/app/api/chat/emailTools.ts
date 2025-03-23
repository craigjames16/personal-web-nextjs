import * as AWS from 'aws-sdk';

export const leaveMessage = async (emailArgs: any): Promise<String> => {
    console.log("Sending email");
    const SENDER = "chisholm.craig@gmail.com";
    const RECIPIENT = "chisholm.craig@gmail.com";
    const { sender, contactInfo, body } = JSON.parse(emailArgs);

    try {
      AWS.config.update({ 
        region: 'ca-central-1', // Change to your preferred region
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Add your access key ID
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // Add your secret access key
      });
      
      const ses = new AWS.SES();

      const params = {
          Destination: {
              ToAddresses: [RECIPIENT],
          },
          Message: {
              Body: {
                  Text: {
                      Charset: "UTF-8",
                      Data: body + "\n\n" + sender + "\n" + contactInfo,
                  },
              },
              Subject: {
                  Charset: "UTF-8",
                  Data: "Craig Chisholm - Personal Website Message",
              },
          },
          Source: SENDER,
      };

      const response = await ses.sendEmail(params).promise();
      console.log(`Email sent! Message ID: ${response.MessageId}`);

      return "Email sent successfully";
    } catch (error: any) {
        console.error(`Error: ${error}`);
        return "Email not sent";
    }
};
