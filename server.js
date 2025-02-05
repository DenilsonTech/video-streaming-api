const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const { uploadVideo, getVideos } = require('./database/db');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/stream', express.static(path.join(__dirname, 'stream')));

// Ensure stream directory exists
const streamDir = path.join(__dirname, 'stream');
if (!fs.existsSync(streamDir)) {
    fs.mkdirSync(streamDir);
}

app.post('/upload', upload.single('file'), async (req, res) => {

    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const { originalname, filename, path: tempPath } = req.file;
        const { title, description } = req.body;

        if(!title){
            fs.unlinkSync(tempPath);
            return res.status(400).json({ error: 'Title is required' });

            }
            //Ciar um diretorio unico para stream
            const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2,15)}`;
            const streamForlder = path.join(streamDir, `stream_${uniqueId}`);
            fs.mkdirSync(streamForlder);

            //Criar um nome unico para o video
            const outputFilename = `output_${uniqueId}.m3u8`;

        //Conversão HLS

        const outputPlaylist = path.join(streamForlder, outputFilename);

        ffmpeg(tempPath)
            .outputOptions([
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .output(outputPlaylist)
            .on('end', async () => {

                //Pegar os caminho relativo ao diretorio stream
                    const relativePath = path.relative(
                        streamDir, 
                        outputPlaylist
                    );
                //Gravas os metadados do video no banco de dados

                const videoId = await uploadVideo(
                    title,
                    description,
                    relativePath
                );

                //Remover o arquivo temporário
                fs.unlinkSync(tempPath);

                res.json({
                    message: 'Video uploaded and converted successfully',
                    videoId,
                    streamPath: path.relative(streamForlder, outputPlaylist)
                })
            })
            .on('error', (error) => {
                console.error('Error converting video:', error);
                res.status(500).json({ error: 'Error converting video' });
            })
            .run();
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Error uploading video' });
    }
})

//Endpoint para obter a lista de videos
app.get('/videos', async (req, res) => {
    try {
        const videos = await getVideos();
        res.json(videos);
    } catch (error) {
        console.error('Erro ao obter vídeos:', error);
        res.status(500).json({ error: 'Erro ao obter vídeos' });
    }
});



app.listen(PORT, () => {
    console.log('Servidor iniciado na porta', PORT);
})