const {existsSync,createWriteStream} = require('fs')
const fs = require('fs/promises')
const pdfparse = require('pdf-parse')
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const { promisify } = require('util'); 
const { exec } = require('child_process');
const JSZip = require("jszip");


const splitPDF = async (outputDirectory, data) => {
    // console.log("split pdf was called")
    // const data = await fs.readFile(pdfFilePath);
    // console.log("pdf data", data)
    const readPdf = await PDFDocument.load(data);
    console.log("pdf read data", readPdf)
    const { length } = readPdf.getPages();
  
    for (let i = 0, n = length; i < n; i += 1) {
      const writePdf = await PDFDocument.create();
      const [page] = await writePdf.copyPages(readPdf, [i]);
      writePdf.addPage(page);
      const bytes = await writePdf.save();
      const outputPath = path.join(outputDirectory, `${i + 1}.pdf`);
      await fs.writeFile(outputPath, bytes);
      console.log(`Added ${outputPath}`);
    }
 };

const emptyFiles = async(filePath) => {
    try {
        for (const file of await fs.readdir(filePath)) {
            //console.log(file)
            await fs.unlink(path.join(filePath, file))
        } 
    } catch (error) {
        console.log('empty files error', error)
    }
    
}
// emptyFiles('statics')
// emptyFiles('download')
// emptyFiles('result')

// splitPDF(path.join('statics', 'c.pdf'), 'download').then(() =>
//  console.log('All labels have been split!').catch(console.log(error))
// );

const sortLabels = async(pdfFile) => {
    try {
        //const pdfFile = await fs.readFile(path.join('statics', 'originalPdf.pdf'))
        await pdfparse(pdfFile).then(async(data) => {
            await fs.writeFile('data.txt',JSON.stringify(data))
            const reg = new RegExp('\\n\\n')
            let textArray = data.text.split(reg)
            console.log(textArray.length)
            let cpLabelArr = [], apLabelArr = [], alliedLabelArr = [], tollLabelArr = [], hunterLabelArr = [], capitalLabelArr = []
            for (let i = 0; i < textArray.length; i++) {
                let labelItem = {carrier: '', orderId: '', page: ''}
                if(textArray[i].includes('Couriers Please')) {
                    //console.log("courier please")
                    labelItem.carrier = "courier please",
                    labelItem.orderId = Number(textArray[i].split("Order:TW")[1].split("Date")[0]),
                    labelItem.page = i
                    cpLabelArr.push(labelItem)
                }else if(textArray[i].includes('Order Ref: ')) { 
                    //console.log("Au post")
                    labelItem.carrier = "au post",
                    labelItem.orderId = Number(textArray[i].split("Order Ref: TW")[1].split(new RegExp('\\n'))[0]),
                    labelItem.page = i
                    apLabelArr.push(labelItem)
                }else if(textArray[i].includes('Order Ref:T')) {
                    //console.log("Allied")
                    labelItem.carrier = "allied",
                    labelItem.orderId = Number(textArray[i].split("Order Ref:TW")[1].split("Date")[0]),
                    labelItem.page = i
                    alliedLabelArr.push(labelItem)
                }else if(textArray[i].includes('ParcelsDESP')) {
                    //console.log("Toll")
                    labelItem.carrier = "toll",
                    labelItem.orderId = Number(textArray[i].split("REF: TW")[1].split("Payor")[0]),
                    labelItem.page = i
                    tollLabelArr.push(labelItem)
                }else if(textArray[i].includes('CourierHunter Express')) {
                    //console.log("Hunter")
                    labelItem.carrier = "hunter",
                    labelItem.orderId = Number(textArray[i].split("Order Ref.TW")[1].split("Date")[0]),
                    labelItem.page = i
                    hunterLabelArr.push(labelItem)
                }else if(textArray[i].includes('Delivered by:')) {
                    console.log("capital")
                    labelItem.carrier = "capital"
                    labelItem.orderId = Number(textArray[i].split("Ref: TW")[1].split(new RegExp('\\n'))[0]),
                    labelItem.page = i
                    capitalLabelArr.push(labelItem)
                }
            }
            cpLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            apLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            hunterLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            tollLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            alliedLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            capitalLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)

            const result = [...cpLabelArr, ...apLabelArr, ...hunterLabelArr, ...tollLabelArr, ...alliedLabelArr, ...capitalLabelArr]
            
            const mergedPdf = await PDFDocument.create()

            for(let item of result) {
                
                const pdfData = await fs.readFile(path.join('download', `${item.page}.pdf`))
                let document = await PDFDocument.load(pdfData)
                const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices())
                copiedPages.forEach((page) => mergedPdf.addPage(page))
                await fs.appendFile(path.join('result', `order_list.txt`), `${item.orderId} \n` , "UTF-8",{'flags': 'a+'});
            }
            console.log('txt has been generated')
            const buf = await mergedPdf.save()
            await fs.writeFile(path.join('result', `result.pdf`), buf);
            console.log('pdf has been generated')
        })
    } catch (error) {
        console.log('error', error)
    }
}

//sortLabels()
const sortFreedomLabels = async(pdfFile) => {
    try {
        //const pdfFile = await fs.readFile(path.join('statics', 'originalPdf.pdf'))
        await pdfparse(pdfFile).then(async(data) => {
            await fs.writeFile('data.txt',JSON.stringify(data))
            const reg = new RegExp('\\n\\n')
            let textArray = data.text.split(reg)
            console.log("textArray length",textArray.length)
            let cpLabelArr = [], apLabelArr = [], alliedLabelArr = [], tollLabelArr = [], hunterLabelArr = [], capitalLabelArr = []
            for (let i = 0; i < textArray.length; i++) {
                let labelItem = {carrier: '', orderId: '', page: ''}
                if(textArray[i].includes('Couriers Please')) {
                    //console.log("courier please")
                    labelItem.carrier = "courier please",
                    labelItem.orderId = Number(textArray[i].split("Order:")[1].split("-")[0]),
                    labelItem.page = i
                    cpLabelArr.push(labelItem)
                }else if(textArray[i].includes('Order Ref: ')) { 
                    //console.log("Au post")
                    labelItem.carrier = "au post",
                    labelItem.orderId = Number(textArray[i].split("Order Ref: ")[1].split("-")[0]),
                    labelItem.page = i
                    apLabelArr.push(labelItem)
                }else if(textArray[i].includes('Dangerous Goods Enclosed')) {
                    //console.log("Allied")
                    labelItem.carrier = "allied",
                    labelItem.orderId = Number(textArray[i].split("Order Ref:")[1].split("-")[0]),
                    labelItem.page = i
                    alliedLabelArr.push(labelItem)
                }else if(textArray[i].includes('Express Parcels')) {
                    //console.log("Toll")
                    labelItem.carrier = "toll",
                    labelItem.orderId = Number(textArray[i].split("REF: ")[1].split("-")[0]),
                    labelItem.page = i
                    tollLabelArr.push(labelItem)
                }else if(textArray[i].includes('Label no:')) {
                    console.log("capital")
                    labelItem.carrier = "capital"
                    labelItem.orderId = Number(textArray[i].split("Ref: ")[1].split("-")[0]),
                    labelItem.page = i
                    capitalLabelArr.push(labelItem)
                }
            }
            cpLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            apLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            hunterLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            tollLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            alliedLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
            capitalLabelArr.sort((firstItem, secondItem) => firstItem.orderId - secondItem.orderId)
           

            const result = [...cpLabelArr, ...apLabelArr, ...hunterLabelArr, ...tollLabelArr, ...alliedLabelArr, ...capitalLabelArr]
            
            const mergedPdf = await PDFDocument.create()

            for(let item of result) {
                
                const pdfData = await fs.readFile(path.join('download', `${item.page}.pdf`))
                let document = await PDFDocument.load(pdfData)
                const copiedPages = await mergedPdf.copyPages(document, document.getPageIndices())
                copiedPages.forEach((page) => mergedPdf.addPage(page))
                await fs.appendFile(path.join('result', `order_list.txt`), `${item.orderId} \n` , "UTF-8",{'flags': 'a+'});
            }
            console.log('txt has been generated')
            const buf = await mergedPdf.save()
            await fs.writeFile(path.join('result', `result.pdf`), buf);
            console.log('pdf has been generated')
        })
    } catch (error) {
        console.log('error', error)
    }
}

const execPromise = promisify(exec)

const compressFiles = async() => {
    try {
        const originalFilePath = path.join( "result", "result.pdf");
        const compressFilePath = path.join("result", "compress.pdf");

        //await fs.writeFile(originalFilePath, "base64")

        await execPromise(
             //`gswin64 -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${compressFilePath}" ${originalFilePath}`
            `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${compressFilePath}" ${originalFilePath}`
        );

        const compressFileBase64 = await fs.readFile(compressFilePath, "base64");

        await fs.unlink(originalFilePath);
        //await fs.unlink(compressFilePath);

    return compressFileBase64;
    } catch (error) {
        throw error
    }
}

//compressFiles()

const splitBigTextLabels = async(req, res) => {
    console.log("slipt labels", req.files.file)
    let file = req.files.file
    try {
        //delete previous files
        //await emptyFiles('statics')
        await emptyFiles('download')
        await emptyFiles('result')
        console.log('previous invoices have been deleted')
        //move new file to static folder
        // await file.mv('statics/originalPdf.pdf', (err) => {
        //     if(err) {
        //         return res.status(500).send("move file error", err)
        //     }
        // })
        //split original files to saperated files by page
        await splitPDF('download', file.data)
        console.log('file has been saperated!')
        await sortLabels(file.data)
        console.log('sorted file has been generated!')
        return res.status(200).json({message: "Sorted Pdf file is ready to downloaded!"})
    } catch (error) {
        console.log("upload error", error)
        return res.status(400).json(req.responder.failed('upload failed', error.message, 400))
    }
}

const splitFreedomLabels = async(req, res) => {
    console.log("slipt freedom labels", req.files.file)
    let file = req.files.file
    try {
        //delete previous files
        //await emptyFiles('statics')
        await emptyFiles('download')
        await emptyFiles('result')
        console.log('previous invoices have been deleted')
        //move new file to static folder
        // await file.mv('statics/originalPdf.pdf', (err) => {
        //     if(err) {
        //         return res.status(500).send("move file error", err)
        //     }
        // })
        //split original files to saperated files by page
        await splitPDF('download', file.data)
        console.log('file has been saperated!')
        await sortFreedomLabels(file.data)
        console.log('sorted file has been generated!')
        return res.status(200).json({message: "Sorted Pdf file is ready to downloaded!"})
    } catch (error) {
        console.log("upload error", error)
        return res.status(400).json(req.responder.failed('upload failed', error.message, 400))
    }
}

const  downloadBigTextLabels = async(req, res) => {
    try {
        //compress big pdf file
        console.log("download begin")
        await compressFiles();
        //generate a zip file contains pdf and txt
        const zip = new JSZip();
        const pdfData = await fs.readFile('result/compress.pdf');
        zip.file('PDFFile.pdf', pdfData);
        const txtData = await fs.readFile('result/order_list.txt');
        zip.file('order_list.txt',txtData)
        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(createWriteStream('result/result.zip'))
        .on('finish', function () {
            console.log("result.zip written.");
            res.download('result/result.zip')
        });
    } catch (error) {
        console.log("download error", error)
        return res.status(400).json(req.responder.failed('download failed', error.message, 400))
    }
}

const shippingRates = async(req, res) => {
    console.log('api was called', req.body)
    try {
        const {ids, provider} = req.body
        const Query = `USE[SBOSELLO] select t.U_INE_PRICE, t.U_INE_CONNOTE, t.Weight, t.Volume, t.Address2  FROM ORDR AS T where T.U_INE_CONNOTE IN (${[...ids]})`
        return await mssqlconnection.connection
            .then(pool => pool.request().query(Query))
            .then(result => {
                result.recordset = result.recordset.map(item => {
                    {return {ref: item.U_INE_CONNOTE, ratedCost: (Number(item.U_INE_PRICE) / 1.1).toFixed(2), weight: Number(item.Weight), volume: Number(item.Volume), address: item.Address2}}
                })
                console.log(result.recordset),
                res.status(200).json(result.recordset)
            })
            .catch(
                //err => res.status(400).json(req.responder.failed('failed',err.message,400))
                err => console.log('mssql error',err)
                )
    } catch (error) {
        res.status(400).json('Warehouse Data Error!')
    }
}

const testAPI = async(req, res) => {
    console.log("test api was called")
    return res.status(200).json({mesage:"new test api called success"})
}

module.exports = {shippingRates,splitBigTextLabels,downloadBigTextLabels,testAPI,splitFreedomLabels}