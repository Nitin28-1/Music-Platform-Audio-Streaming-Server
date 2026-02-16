const express=require('express');

const fs=require('fs');
const path=require('path')

const app=express();

app.use(express.json());

app.get('/play-music/:musicId',(req,res)=>{

    //streaming logic of music

    const {musicId}=req.params;
    const fileName=path.join(__dirname,'Files',`song${musicId}.mp3`);
    const stat=fs.statSync(fileName);
    const fileSize=stat.size;
 

    const range=req.headers.range;
    // console.log("Range kya hai",range);

    if(range)
    {
        const size=100 * 1024 //100kb chunk size
    
        const parts=range.replace(/bytes=/,'').split('-');
        const start=parseInt(parts[0],10);
        const end=parts[1] ? parseInt(parts[1],10) : Math.min(start + size -1,fileSize-1);
    // console.log("Start End kya aa rha hai ",start, "   ",end);
        const chunkSize=end-start+1;
        const file=fs.createReadStream(fileName,{start,end});

        const head={
            'Content-Range':`bytes ${start}-${end}/${fileSize}`,
            'Content-Type':'audio/mpeg',
            'Content-Length':chunkSize,
            'Accept-Ranges':'bytes'
        }
        res.writeHead(206,head);
        file.pipe(res);
    }
    else
    {
        // console.log('else wala part call ho rha hai ')
        const head={
            'Content-Type':'audio/mpeg',
            'Content-Length':fileSize
        };

        res.writeHead(200,head);

        const file=fs.createReadStream(fileName);
        file.pipe(res);
    }

});

app.listen(8000,()=>{
    console.log("Server is Running On Port No 8000")
})