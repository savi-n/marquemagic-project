const crypto = require('crypto');

// Encrypt the data using Key AES/CBC/PKCS5Padding 128-bit
const cryptoAesCbcEncrypt = (data, key, iv) => {
    let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
};

// Decrypt the data using Key AES/CBC/PKCS5Padding 256-bit
const cryptoAesCbcDecrypt = (encryptedData, key, iv) => {
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8')
    return(decrypted);
};

// var crypto = require('crypto');

// module.exports = 
// {
  const generateRandomHex = (byteLength) => {
        var stringLength = byteLength * 2;

        var alphabet = "abcdef0123456789";
        var s = "";

        for (var i = 0; i < stringLength; i++)
        {
            var r = Math.floor(Math.random()*alphabet.length);

            s += alphabet[r];
        }

        //prevent null block.
        s = s.replace(new RegExp("00", 'g'), "11");

        return s;
    };

   const dataFromHexString = (hexString) =>
    {
        hexString = hexString.trim();
        hexString = hexString.replace(new RegExp(' ', 'g'), '');
        hexString = hexString.toLowerCase();

        var i;
        for(i=0;i<hexString.length;i++)
        {
            if("abcdef0123456789".indexOf(hexString[i]) == -1)
            {
                throw new Error('Invalid encryption hex data');
            }
        }

        var buffer = Buffer.from(hexString, 'hex');;
        return buffer;
    };

   const dataToHexString = (buffer) =>
    {
        var hex = buffer.toString('hex')

        return hex;
    };

    const encryptDataAES = (plainText, hexKey) =>
    {
        checkKey(hexKey);
        var hexIV = generateRandomHex(16);
        var hexString = Buffer.from(plainText, 'utf8').toString('hex');
        var cipherHexStr = encryptData(hexString, hexKey, hexIV);

        var hmacHexKey = generateRandomHex(16);
        var hmacHexStr = computeHMAC(hexIV, cipherHexStr, hexKey, hmacHexKey);

        var encrypt_data = hexIV + hmacHexKey + hmacHexStr + cipherHexStr;

        return encrypt_data;
    };

    const decryptDataAES = (hexStr, hexKey) =>
    {
        checkKey(hexKey);
        var plainText = null;

        if (hexStr.length > 128)
        {
            var hexIV = hexStr.substr(0, 32);
            var hmacHexKey = hexStr.substr(32, 32);
            var hmacHexStr = hexStr.substr(64, 64);
            var cipherHexStr = hexStr.substr(128);

            var computedHmacHexStr = computeHMAC(hexIV, cipherHexStr, hexKey, hmacHexKey);

            if (computedHmacHexStr.toLowerCase() == hmacHexStr.toLowerCase())
            {
                var decryptedStr = decryptData(cipherHexStr, hexKey, hexIV);
                plainText = Buffer.from(decryptedStr, 'hex').toString('utf8');
            }
        }

        return plainText;
    };

    const checkKey = (hexKey) => 
    {
        hexKey = hexKey.trim();
        hexKey = hexKey.replace(new RegExp(' ', 'g'), '');
        hexKey = hexKey.toLowerCase();

        if(hexKey.length != 64)
        {
            throw new Error("key length is not 256 bit (64 hex characters)");
        }

        var i;
        for(i=0;i<hexKey.length;i+=2)
        {
            if(hexKey[i] == '0' && hexKey[i+1] == '0')
            {
                throw new Error("key cannot contain zero byte block");
            }
        }
    };

    const computeHMAC = (hexIV, cipherHexStr, hexKey, hmacHexKey) =>
    {
        hexKey = hexKey.trim();
        hexKey = hexKey.replace(new RegExp(' ', 'g'), '');
        hexKey = hexKey.toLowerCase();

        hmacHexKey = hmacHexKey.toLowerCase();

        var hexString = hexIV + cipherHexStr + hexKey;
        hexString = hexString.toLowerCase();

        var hmac = crypto.createHmac('sha256', hmacHexKey);
        hmac.update(hexString);

        var hashHexStr = hmac.digest('hex');
        return hashHexStr;
    };

    const encryptData =  (hexString, hexKey, hexIV) =>
    {
        var data = dataFromHexString(hexString);
        var key = dataFromHexString(hexKey);
        var iv = dataFromHexString(hexIV);

        var cipher = crypto.createCipheriv('aes256', key, iv);
        //var encryptedBufferData = Buffer.concat([cipher.update(data), cipher.final()]); 
        var encryptedData = cipher.update(data, 'binary', 'hex')  + cipher.final('hex');

        return encryptedData;
    };

    const decryptData = (hexString, hexKey, hexIV) =>
    {
        var data = dataFromHexString(hexString);
        var key = dataFromHexString(hexKey);
        var iv = dataFromHexString(hexIV);

        var decipher = crypto.createDecipheriv('aes256', key, iv);
        //var encryptedBufferData = Buffer.concat([cipher.update(data), cipher.final()]); 
        var decryptedData = decipher.update(data, 'binary', 'hex') + decipher.final('hex');

        return decryptedData;
    };
// };

module.exports = {
    friendlyName: 'rsa',
    description: 'encrypt/decrypt long messages using rsa',

    inputs: {
        action: {
            type: 'string',
            required: true
        },
        data: {
            type: 'ref'
        },
        key: {
            type: 'ref'
        },
        iv: {
            type: 'ref'
        }
    },

    fn: async (inputs, exits) => {
        const action = inputs.action;
        if (action === 'aesCbcEncrypt') 
            return exits.success(cryptoAesCbcEncrypt(inputs.data, inputs.key, inputs.iv));
         else if (action === 'aesCbcDecrypt') 
            return exits.success(cryptoAesCbcDecrypt(inputs.data, inputs.key, inputs.iv));
        else if(action === 'encryptDataAES')
            return exits.success(encryptDataAES(inputs.data, inputs.key));
        
            else if(action === 'decryptDataAES')
            return exits.success(decryptDataAES(inputs.data, inputs.key));
        
    }
};
