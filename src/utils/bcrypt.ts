import { InternalServerErrorException } from '@nestjs/common'
import Logging from 'library/Logging'
import * as bcrypt from 'bcrypt'

export const hash = async (data: string, salt = 10): Promise<string> => {
  try {
    const generatedSalt = await bcrypt.genSalt(salt)
    return bcrypt.hash(data, generatedSalt)
  } catch (error) {
    Logging.error(error)
    throw new InternalServerErrorException('Something went wrong while hashing password')
  }
}

export const compareHash = async (data: string | Buffer, encryptedData: string): Promise<boolean> => {
  try {
    //throw new InternalServerErrorException(`here-> ${data}`)
    //return bcrypt.compare(data, encryptedData)
    //console.log(`data ${data} encdata${encryptedData}`)
    const abcd = bcrypt.compare(data, encryptedData)
    //console.log("CompareHash2")
    //Logging.log("was good in compare hash")
    return abcd
    //throw new InternalServerErrorException(`here-> ${abcd}`)
    
  } catch (error) {
    Logging.error(error)
    throw new InternalServerErrorException('Something went wrong while comparing hash')
  }
}
