require('dotenv').config()

const user = "Zaouich123" // Username
const url = `https://api.github.com/users/${user}/repos?sort=updated&direction=desc`; // get all repos from your github
const url2 = `https://api.github.com/repos/${user}/${user}/contents/README.md`; // the readme for your main page
const token = process.env.TOKEN; // Api token



// 
async function getRequest(url,token){
    try{
    const response = await fetch(url,{ 
        headers: {
            Authorization: `token ${token}`
        }
        })
        //console.log(await response.json())
        return await response.json()
    }
    catch(error){
        console.error(error.message)
    }
}

function mostRecentDate(json,user){
    let bestdate='1999-06-07T13:52:30Z'
    let bestjson=null;
    json.forEach(element => {
        if(element["created_at"] > bestdate && element["html_url"]!== `https://github.com/${user}/${user}`){
            bestdate=element["created_at"]
            bestjson=element
        }
    });
    //console.log("best",bestjson)
    return bestjson
}

//Found the latest repository from your github
async function latestRepo(url,token,user){
    const json = await getRequest(url,token)
    let lastRepo = mostRecentDate(json,user)
    return lastRepo["html_url"]
}


async function getReadme (url2,url,token,user){
    //
    const request = await getRequest(url,token)
    
    const latestRepository= await latestRepo(url2,token,user)
    //console.log(latestRepository)
    const content64 = await request["content"]
    // Get the sha from the file 
    //const sha = await request["sha"]
    //console.log("The sha", sha)
    // Base64 to UTF-8
    let contentUTF = Buffer.from(content64, 'base64').toString('utf-8'); 
    // Replace the latest project
    const recherche = /(<h3>My latest project : .*?<\/h3>)/g;
    //const found = contentUTF.match(recherche);
    const replaceSentence = `<h3>My latest project : ${latestRepository}</h3>`;
    contentUTF = contentUTF.replace(recherche, replaceSentence);
    console.log("contenu",contentUTF)
    contentUTF = Buffer.from(contentUTF, 'UTF-8').toString('base64'); 
    request["content"] = contentUTF
    //console.log("readme : " , request)

    return request["content"]
}


//async function modifyReadme (url2,token,user)


async function getSha(url,token,user){
    const request = await getRequest(url,token,user)
    const sha = request["sha"]
    
    return sha
}


async function modifyReadme(url,url2,token,user){
    const sha = await getSha(url2,token,user)
    //console.log(sha)
    const latestRepository = await getReadme(url,url2,token,user)
    //console.log("test base64",latestRepository)
    try{
        const response = await fetch(url2,{ 
            method: "PUT",
            body: JSON.stringify({
                message : "Readme Update",
                sha: sha,
                content : latestRepository
              }),
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `token ${token}`

            }
            })
            //console.log(await response.json())

            //return await response.json()
    }
    catch(error){
        console.error(error.message)
    }
}







modifyReadme(url,url2,token,user)
setInterval(() => {
    modifyReadme(url,url2,token,user)
}, 86400000);









