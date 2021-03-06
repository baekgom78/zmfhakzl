var photovleML = 'https://da52-218-150-182-248.jp.ngrok.io';
// var photovleML =  'http://192.168.45.218:5000';
// var photovleML =  'http://172.30.1.52:5000';
// var photovleML =  'http://119.194.99.62:18806';
// var photovleML =  'https://da52-218-150-182-248.jp.ngrok.io/.';
// var photovleML =  'http://116.121.38.22:5000';

// 전역 변수 정의
let frames = [];      // 분리 된 영상 이미지 리스트
const predictframes = [];
let file;               // 동영상 파일 객체
let stopped = false;    // 이미지 분리 기준

let canvasImage;        // 이미지만 띄우는 Canvas
let ctxImage;           // 이미지만 띄우는 Canvas

let bErasing = false;   // 지우개 토글 기준
let isDivideVideo = false; // 영상 분할 여부

var selectedFrameItem;  // 현재 이미지 선택된 객체
var previousCanvasId = 0;
var isclickTrainImage = false;
var pagenumber = 1;
var preindex = -1; 

// canvas 도구
var dragging = false;
var radius = 15;
var currentSelectedColor = "red";
var currentLineWidth = radius * 2;

// 학습
let isTrainOK = false;

//승훈 추가
let bHanding = false; // 핸딩 토글 기준

//데모용
let recommend_value;
let infor_width = 32;
let infor_height = 10;
let infor_number = 1;
let infor_title = "파일 업로드";
let infor_content = "파일 업로드 버튼을 눌러 작업할 영상을 선택하세요."
let notice_content = "현재는 업로드가 제한되어 클릭 시, 데모 영상으로 자동 업로드됩니다!"

//3번 째 안내 있나요
let startThree = false;


let editbarRect = document.querySelector('.edit-bar').getBoundingClientRect();
const fixed_w = editbarRect.width;
const fixed_h = editbarRect.height;

//모달에서 이미지 선택
let pickedN = -1;

//현재시간 정보
let nowtimeis;

const datenow = Date.now();
const dateyear = new Date(datenow);
var year = dateyear.getFullYear().toString().slice(-2); //년도 뒤에 두자리
var month = ("0" + (dateyear.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
var day = ("0" + dateyear.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)
var hour = ("0" + dateyear.getHours()).slice(-2); //시 2자리 (00, 01 ... 23)
var minute = ("0" + dateyear.getMinutes()).slice(-2); //분 2자리 (00, 01 ... 59)
var second = ("0" + dateyear.getSeconds()).slice(-2); //초 2자리 (00, 01 ... 59)
var returnDate = "20" + year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second; 


// 그림판 그리기
function setColor(color) {
    currentSelectedColor = color;
    var active = document.getElementsByClassName('active')[0];
    if (active) {
        active.className = 'swatch';
    }
}

function setSwatch(e) {
    bHanding = false;
    bErasing = false;
    var swatch = e.target;

    setColor(swatch.style.backgroundColor);
    swatch.className += ' active';
}

var setRadius = function (newRadius) {
    if (newRadius < minRad) newRadius = minRad;
    else if (newRadius > maxRad) newRadius = maxRad;
    radius = newRadius;
    currentLineWidth = radius * 2;
    radSpan.innerHTML = radius;
}

var minRad = 1,
    maxRad = 200,
    defaultRad = 16,
    interval = 5,
    radSpan = document.getElementById('radval'),
    decRad = document.getElementById('decrad'),
    incRad = document.getElementById('incrad');

decRad.addEventListener('click', function () {
    setRadius(radius - interval);
});
incRad.addEventListener('click', function () {
    setRadius(radius < interval ? interval : radius + interval);
});

var buttonclear = document.getElementById('clear');
buttonclear.addEventListener('click', clearImage);

function clearImage() {
    // 비디오 업로드 사전 체크
    if (isDivideVideo == false) {
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if (isclickTrainImage == false) {
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return;
    }

    const currentCanvas = document.getElementById("canvas-drawing-" + previousCanvasId);
    const currentContext = currentCanvas.getContext("2d");

    var currentFillStyle = currentContext.fillStyle;
    currentContext.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
    currentContext.rect(0, 0, currentCanvas.width, currentCanvas.height);
    currentContext.fillStyle = "rgba(255, 0, 0, 0%)";
    currentContext.fill();
    currentContext.beginPath();
    currentContext.fillStyle = currentFillStyle;
    currentContext.strokeStyle = currentFillStyle;
};

function handImage() {
    // 비디오 업로드 사전 체크
    if (isDivideVideo == false) {
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if (isclickTrainImage == false) {
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return;
    }
    bHanding = !bHanding;
    bErasing = false;
};

function eraserImage() {
    // 비디오 업로드 사전 체크
    if (isDivideVideo == false) {
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if (isclickTrainImage == false) {
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return;
    }
    bErasing = !bErasing;
    bHanding = false;
};

var button = document.getElementById('save');
button.addEventListener('click', saveImage);

function saveImage(el) {
    // 비디오 업로드 사전 체크
    if (isDivideVideo == false) {
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if (isclickTrainImage == false) {
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return;
    }
    bErasing = true;

    var canvas = document.getElementById("canvas-combined-" + previousCanvasId);
    const link = document.createElement('a');
    const labelName = document.getElementById('label_name').innerHTML;
    if (labelName == null) {
        labelName = "object";
    }

    link.download = labelName + "-label-" + previousCanvasId + ".png";
    link.href = canvas.toDataURL();
    link.click();
    link.delete;

    var canvasImage = document.getElementById("imgViewer");
    const linkImage = document.createElement('a');
    console.log("labelName: ", labelName);
    linkImage.download = labelName + "-image-" + previousCanvasId + ".png";
    linkImage.href = canvasImage.toDataURL();
    linkImage.click();
    linkImage.delete;

};

function initDrawingBoard() {
    var colors = ['red', 'pink', 'yellow', 'yellowgreen', 'green', 'cyan']; //Color array to select from

    for (var i = 0, n = colors.length; i < n; i++) {
        var swatchbox = document.createElement('div');
        swatchbox.className = "swatchbox";
        document.getElementById('colors').appendChild(swatchbox);

        var swatch = document.createElement('nav');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = colors[i];
        swatch.addEventListener('click', setSwatch);
        swatchbox.appendChild(swatch);
    }
}

function checkVideoLoading() {
    if (isDivideVideo == false) {
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if (isclickTrainImage == false) {
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return;
    }
}

// 사용자 업로드 영상 불러오기
async function loadUploadVideo() {
    console.log("1. loadUploadVideo");

    const mediaBlob = await fetch('/static/video/testmp4.mp4')
    .then(response => response.blob());

    file = new File(
    [mediaBlob],
    "데모영상.mp4",
    { type: 'video/mp4' }
    );

    // 1) Information 정보 추가
    setInformation(file);

    // 2) 다음 작업 공간으로 이동
    setControlBarTwo();

    // 3) 서버 비디오 업로드
    sendVideo();
} 


// Information 정보 추가
function setInformation(file){
    const fileName = document.querySelector("#file_name");
    fileName.textContent = file['name'];

    const fileSize = document.querySelector("#file_size");
    fileSize.textContent = file['size'] + " byte";

    const fileType = document.querySelector("#file_type");
    fileType.textContent = file['type'];
}

// 비디오 업로드 후 유사이미지 선택 공간으로 이동
function setControlBarTwo(){
    document.getElementById("step1").style.display = 'none';
    document.getElementById("step2").style.display = 'block';
    document.getElementById("step3").style.display = 'none';
}

// 유사이미지 선택 후 확인하는 공간으로 이동
function setControlBarThree(){
    document.getElementById("step1").style.display = 'none';
    document.getElementById("step2").style.display = 'none';
    document.getElementById("step3").style.display = 'block';
}

// 비디오 이미지 분리를 위한 재생 함수
async function getVideoTrack(video, videourl) {
    var video = document.getElementById("video");
    var videourl = URL.createObjectURL(file);

    video.crossOrigin = "anonymous";
    video.src = videourl;
    document.body.append(video);

    await video.play();
    const [track] = video.captureStream().getVideoTracks();
    video.onended = (evt) => track.stop();
    return track;
} 

// 비디오를 각 프레임으로 분할(분할 아이콘 클릭)
async function divideVideo(){
    if (document.querySelector("#label_name").textContent == "") {
        alert("레이블링의 object를 정의해주세요.");
        return;
    }
    if (window.MediaStreamTrackProcessor) {
        isDivideVideo = true;
        const track = await getVideoTrack();

        const processor = new MediaStreamTrackProcessor(track);
        const reader = processor.readable.getReader();
        
        readChunk();

        function readChunk() {
            const select = document.querySelector("select");
            reader.read().then(async ({ done, value }) => {
                if (value) {
                    const bitmap = await createImageBitmap(value);
                    const index = frames.length;

                    frames.push(bitmap);

                    select.append(new Option("Frame #" + (index + 1), index));
                    createImageList(index, bitmap);
                    setInformationTotalFrmae(index);
                    createCanvas(bitmap.width, bitmap.height);
                }
                if (!done && !stopped) {
                    readChunk();
                } else {
                    select.disabled = false;
                }
            });
            imgSplittingButton.onclick = (evt) => stopped = true;
        }
    } else {
        console.error("your browser doesn't support this API yet");
    }
}

// 컨트롤 바 속 이미지들 집합
function createImageList(index, bitmap) {
    //  <li>
    //      <canvas></canvas>
    //      <p>frame-idx</p>
    //  </li>

    // li 태그
    const imageItem = document.createElement("li");
    imageItem.setAttribute("id", "frame-" + (index + 1));
    imageItem.setAttribute("class", "image-item");
    imageItem.onclick = onClickSpecificFrame;

    // canvas 태그
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = 120;
    imageCanvas.height = 100;
    const imageCtx = imageCanvas.getContext("2d");
    imageCtx.drawImage(bitmap, 0, 0, 120, 100);

    // p 태그
    const imageId = document.createElement("p");
    imageId.textContent = "frame-" + (index + 1);

    imageItem.append(imageCanvas);
    imageItem.append(imageId);

    // ul 태그 추가
    const imageListUl = document.getElementById("image-list");
    imageListUl.append(imageItem);
}

// 작업 중인 Frame 수 지정
function setInformationTotalFrmae(index){
    const fileTotalFram = document.querySelector("#file_frame");
    fileTotalFram.textContent = index + 2;
}

// object 이름 지정 위한 모달 ON
function modalOpen(){
    
    modal.style.display = 'block';
}

// 모달에 입력된 값 저장
function define_tag() {
    const label = document.getElementById("label_tag").value;

    const fileName = document.querySelector("#label_name");
    fileName.textContent = label;
    savelabel = label;
    const modal = document.querySelector('.modal');
    modal.style.display = "none"

    // 3번째 안내
    startThree = true;
    infor_width = 32;
    infor_height = 10;
    infor_number = 3;
    infor_title = "라벨링";
    infor_content = "도구를 이용하여 모자이크를 제외할 대상을 칠해주세요"
    notice_content = "손바닥, 색깔 버튼만 활용해주세요."
    open_black_background();
    make_markedbox("#toolbara");
}

// object 이름 지정 위한 모달 OFF
function modalOff() {
    modal.style.display = "none"
}

// 사진만 띄우는 canvas 사전 선언
function baseImageViewer() {
    canvasImage = document.getElementById("imgViewer");
    ctxImage = canvasImage.getContext("2d");
}
//모달에 추천 이미지 6장 불러오기
async function loadingRecommendImage(){
    let idx = 0;
    const modal_w = 360;
    const modal_h = 300;


    for(let i =0; i<2; i++){

        const rowdiv = document.createElement("div");
        rowdiv.setAttribute("class", "rowdiv");

        for(let j =0; j<3; j++){
            const imageItem = document.createElement("li");
            imageItem.setAttribute("class", "rec-item");

            // canvas 태그
            const imageCanvas = document.createElement("canvas");
            imageCanvas.setAttribute("id", "rec_frame-" + (idx));
            imageCanvas.setAttribute("class", "not_picked");
            imageCanvas.width = modal_w;
            imageCanvas.height = modal_h;
            imageCanvas.value = idx;
            imageCanvas.addEventListener('click', pickedImage);

            const imageCtx = imageCanvas.getContext("2d");
            // imageCtx.drawImage(frame, 0, 0, modal_w, modal_h);

            imageItem.append(imageCanvas);
            rowdiv.append(imageItem);

            idx++;
        }
        // div 안에 넣기
        const imageListUl = document.getElementById("recommend_body");
        imageListUl.append(rowdiv);

    }

}

//하나씩 그려주는 함수
async function drawRecommendImage(index, bitmapimage){
    const modal_w = 360;
    const modal_h = 300;
    const imgCanvas = document.getElementById('rec_frame-' + String(index));
    const imgCtx = imgCanvas.getContext("2d");
    imgCtx.drawImage(bitmapimage, 0, 0, modal_w, modal_h);
}

// 클릭할 때
function pickedImage(e){
    let pickedcanvas = e.target;
    pickedN = pickedcanvas.value;
    recommend_value = e.target.value
    var picked = document.getElementsByClassName('picked')[0];
    if (picked) {
        picked.className = 'not_picked';
    }
    pickedcanvas.className = 'picked';
}

// 각 프레임 별 canvas 생성
function createCanvas(bitmapWidth, bitmapHeight) {
    const liTag = document.createElement('li');
    //zoom 변수 추가
    let cameraZoom = 1
    let MAX_ZOOM = 5
    let MIN_ZOOM = 0.1
    const SCROLL_SENSITIVITY = 0.0005

    //move 변수 추가
    let cameraOffset = { x: 0, y: 0 }
    let dragStart = { x: 0, y: 0 }


    liTag.className = "drawArea";
    // liTag.style.maxWidth = "1280px";
    // liTag.style.maxHeight = "720px";
    // liTag.style.overflow = "scroll";
    liTag.style.position = "absolute";
    liTag.style.zIndex = 2;
    liTag.style.display = "none";

    const predefinedCanvas = document.createElement("canvas");
    predefinedCanvas.setAttribute("id", "canvas-drawing-" + document.getElementById("drawAreaStack").childNodes.length);

    const context = predefinedCanvas.getContext("2d");

    predefinedCanvas.width = fixed_w;
    predefinedCanvas.height = fixed_h;

    //그림 저장 canvas
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.setAttribute("id", "canvas-combined-" + document.getElementById("drawAreaStack").childNodes.length);
    combinedCanvas.style.border = "none";
    combinedCanvas.style.display = "none";

    const combinedctx = combinedCanvas.getContext("2d");

    combinedCanvas.width = bitmapWidth;
    combinedCanvas.height = bitmapHeight;



    /////////////////////////////////////////////////////
    var putPoint = function (e) {
        if (bHanding) {
            document.getElementById("hand-cursor").style.display = 'block';

            document.getElementById("mouse-cursor").style.backgroundColor = 'rgba(0, 0, 0, 0)';
            const w = document.getElementById("mouse-cursor").style.width.split("px")[0];
            const h = document.getElementById("mouse-cursor").style.height.split("px")[0];
            document.getElementById("mouse-cursor").style.top = (e.offsetY - h / 2) + "px";
            document.getElementById("mouse-cursor").style.left = (e.offsetX - w / 2) + "px";
        } else if (bErasing) {
            document.getElementById("hand-cursor").style.display = 'none';
            document.getElementById("mouse-cursor").style.width = currentLineWidth + "px";
            document.getElementById("mouse-cursor").style.height = currentLineWidth + "px";
            document.getElementById("mouse-cursor").style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            document.getElementById("mouse-cursor").style.border = '#fff';

            const w = document.getElementById("mouse-cursor").style.width.split("px")[0];
            const h = document.getElementById("mouse-cursor").style.height.split("px")[0];

            document.getElementById("mouse-cursor").style.top = (e.offsetY - h / 2) + "px";
            document.getElementById("mouse-cursor").style.left = (e.offsetX - w / 2) + "px";

        } else {
            document.getElementById("hand-cursor").style.display = 'none';
            document.getElementById("mouse-cursor").style.width = currentLineWidth + "px";
            document.getElementById("mouse-cursor").style.height = currentLineWidth + "px";
            document.getElementById("mouse-cursor").style.backgroundColor = currentSelectedColor;

            const w = document.getElementById("mouse-cursor").style.width.split("px")[0];
            const h = document.getElementById("mouse-cursor").style.height.split("px")[0];

            document.getElementById("mouse-cursor").style.top = (e.offsetY - h / 2) + "px";
            document.getElementById("mouse-cursor").style.left = (e.offsetX - w / 2) + "px";
        }

        if (bHanding && dragging) {
            cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x
            cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y
            redraw(cameraZoom, predefinedCanvas, combinedCanvas, context, cameraOffset);
        }
        else if (dragging) {
            // context.lineTo(e.offsetX, e.offsetY);
            // context.stroke();
            // context.beginPath();
            // context.arc(e.offsetX, e.offsetY, radius, 0, Math.PI * 2);
            // context.fill();
            // context.beginPath();
            // if (bErasing == true) {
            //     context.globalCompositeOperation = "destination-out";
            // } else {
            //     context.globalCompositeOperation = "source-over";
            // }
            // combinedctx.moveTo(e.offsetX, e.offsetY);

            let fixed_radius = (1 / cameraZoom) * radius;
            let fixed_offsetX = (e.offsetX / cameraZoom) - cameraOffset.x;
            let fixed_offsetY = (e.offsetY / cameraZoom) - cameraOffset.y;

            // combinedctx.lineTo(e.offsetX, e.offsetY);
            // combinedctx.stroke();
            combinedctx.beginPath();
            combinedctx.arc(fixed_offsetX, fixed_offsetY, fixed_radius, 0, Math.PI * 2);
            combinedctx.fill();
            combinedctx.beginPath();
            if (bErasing == true) {
                combinedctx.globalCompositeOperation = "destination-out";
            } else {
                combinedctx.globalCompositeOperation = "source-over";
            }
            // combinedctx.moveTo(e.offsetX, e.offsetY);

            redraw(cameraZoom, predefinedCanvas, combinedCanvas, context, cameraOffset);
        }
    }

    var engage = function (e) {

        dragging = true;

        //이동 일때
        if (bHanding) {
            dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x
            dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y
        } else {
            const currentCanvas = document.getElementById("canvas-combined-" + previousCanvasId);
            const currentContext = currentCanvas.getContext("2d");

            currentContext.fillStyle = currentSelectedColor;
            currentContext.strokeStyle = currentSelectedColor;
            currentContext.lineWidth = currentLineWidth;

            putPoint(e);
        }
    }

    var disengage = function () {
        dragging = false;
        combinedctx.beginPath();
    }

    var canvasMouseEnter = function (e) {
        document.getElementById("mouse-cursor").style.display = 'block';
    }

    var canvasMouseOver = function (e) {
        document.getElementById("mouse-cursor").style.display = 'none';
    }

    var zoomin = function (zoomAmount, zoomFactor) {
        const frame = frames[previousCanvasId];
        let w = frame.width;
        let h = frame.height;


        if (!dragging) {
            previousZoom = cameraZoom;

            if (zoomAmount) {
                cameraZoom += zoomAmount
            }
            else if (zoomFactor) {
                cameraZoom = zoomFactor * lastZoom
            }

            cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
            cameraZoom = Math.max(cameraZoom, MIN_ZOOM)
        }

        if (w * cameraZoom <= fixed_w || h * cameraZoom <= fixed_h) {
            cameraZoom = previousZoom;
        } else {
            redraw(cameraZoom, predefinedCanvas, combinedCanvas, context, cameraOffset);
        }
    }

    predefinedCanvas.addEventListener('mousedown', engage);
    predefinedCanvas.addEventListener('mouseup', disengage);
    predefinedCanvas.addEventListener('mousemove', putPoint);
    //zoom in,out function
    predefinedCanvas.addEventListener('wheel', (e) => zoomin(e.deltaY * SCROLL_SENSITIVITY));

    predefinedCanvas.addEventListener('mouseenter', canvasMouseEnter);
    predefinedCanvas.addEventListener('mouseleave', canvasMouseOver);


    /////////////////////////////////////////////////////
    combinedctx.strokeStyle = 'red';
    combinedctx.lineWidth = '30';
    // combinedctx.lineCap = ctx.lineJoin = 'round';
    combinedctx.lineCap = "round";

    // 3) li 태그들 -> ul 태그 넣기
    liTag.appendChild(predefinedCanvas);
    liTag.appendChild(combinedCanvas);

    document.getElementById("drawAreaStack").appendChild(liTag);
}

// 프레임을 클릭한 경우 -> canvas 호출
function onClickSpecificFrame(){
    isclickTrainImage = true;
    var clickFrameID = this.getAttribute('id');
    console.log(clickFrameID)
    
    onClickSpecificFrameDegin(clickFrameID);    // font 디자인
    changeInfromationNowFrame(clickFrameID);    // infromation 업데이트

    const currentCanvasId = clickFrameID.split('-')[1];
    const frame = frames[currentCanvasId];
    // canvasImage.width = frame.width;
    // canvasImage.height = frame.height;
    // ctxImage.drawImage(frame, 0, 0);
    canvasImage.width = fixed_w;
    canvasImage.height = fixed_h;
    ctxImage.drawImage(frame, 0, 0);

    // previousCanvasId
    document.getElementById("canvas-drawing-" + previousCanvasId).parentNode.style.display = "none";
    document.getElementById("canvas-drawing-" + currentCanvasId).parentNode.style.display = "block";

    previousCanvasId = currentCanvasId;

    // 모델 예측 요청
    // predictObject();
}

//Recommend Modal -> Drawing Canvas
function onClickModalFrame(){
    isclickTrainImage = true;
    var clickFrameID = ('rec_frame-' + recommend_value);
    console.log(clickFrameID)
    
    onClickSpecificFrameDegin(clickFrameID);    // font 디자인
    changeInfromationNowFrame(clickFrameID);    // infromation 업데이트

    const currentCanvasId = clickFrameID.split('-')[1];
    const frame = frames[currentCanvasId];
    // canvasImage.width = frame.width;
    // canvasImage.height = frame.height;
    // ctxImage.drawImage(frame, 0, 0);
    canvasImage.width = fixed_w;
    canvasImage.height = fixed_h;
    ctxImage.drawImage(frame, 0, 0);

    // previousCanvasId
    document.getElementById("canvas-drawing-" + previousCanvasId).parentNode.style.display = "none";
    document.getElementById("canvas-drawing-" + currentCanvasId).parentNode.style.display = "block";

    previousCanvasId = currentCanvasId;

    // 모델 예측 요청
    // predictObject();

    // 2번째 안내
    infor_width = 24;
    infor_height = 10;
    infor_number = 2;
    infor_title = "라벨 제목 입력";
    infor_content = "저장할 때 쓰일 라벨명을 입력해주세요."
    notice_content = ""
    open_black_background();
    make_markedbox(".edit-label-name");
}

function onClickSpecificFrameDegin(clickFrameID) {
    // 기존 선택된 frame 디자인 삭제
    if (selectedFrameItem != null) {
        selectedFrameItem.style.color = 'black';
        selectedFrameItem.style.fontWeight = 400;
    }

    // 선택된 frame 디자인 추가
    selectedFrameItem = document.getElementById(clickFrameID);
    selectedFrameItem.style.color = '#708AE8';
    selectedFrameItem.style.fontWeight = 600;
}

function changeInfromationNowFrame(clickFrameID) {
    const fileNow = document.querySelector("#label_now");
    fileNow.textContent = clickFrameID;
}

// 마우스 커서 도형으로 대체하기
function mouseCursorMove(e){
    x = e.clientX, y = e.clientY; 
    h1.innerHTML = `x: ${x} y: ${y}`; 
    cursor.style.transform = `translate(${x}px, ${y}px)`;
}


    
    


// 비디오 전송
function sendVideo(){
    try {
        if(user_phone.length == 0){
            alert("로그인 세션이 만료되었습니다.");
            return;
        }
    } catch (error) {
        console.error(error);
        alert("로그인 세션이 만료되었습니다.");
        return;     
    }   

    console.log("2. sendVideo", user_id, user_phone);
    nowtimeis = returnDate
    var frm = new FormData();
    frm.append("video", file);
    frm.append("user_id", user_phone);
    frm.append("timestamp", nowtimeis)
    loadingVeiw("simimg",true);
    axios.post(photovleML + '/data/video/upload', frm, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
        
    })
    
    .then((response) => {
        console.log("3. 6 similarity image", response); 
        
        const select = document.querySelector("select");       
        for(i=1;i<7;i++)
        {
            var simarr = response.data[i]
            if(simarr.length == 0){
                alert("유사이미지를 못 가져왔어요. 다시 시도해주세요.");
                return;
            }
            const webpdata = "data:image/png;base64," + simarr; // base64 데이터 url 정보
            
            var index = -1;
            // base64 데이터에 접근
            
            fetch(webpdata)
            .then(response => response.blob())
            .then(blob =>{
                Promise.all([
                    createImageBitmap(blob)
                ]).then(function(result){
                    frames.push(result[0]);
                    // createImageList(index, result[0]);
                    setInformationTotalFrmae(index);
                    createCanvas(result[0].width, result[0].height);
                    index = index + 1;
                    return result[0]
                }).then(function(result){
                    drawRecommendImage(index, result);
                });
            })
        }
        isDivideVideo = true;
        loadingVeiw("simimg",false)
    }).then(_ => {
        selectedmodalopen();
        
    })
    .catch((error) => {
        console.log("영상 업로드가 실패되었습니다. 서버를 확인해주세요.");
    })
}


function dataURItoBlob(dataURI, filename){
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    console.log('mimeString : ', mimeString);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++)
    {
        ia[i] = byteString.charCodeAt(i);
    }

    var bb = new Blob([ab], { "type": mimeString });
    return bb;
}

function loadingVeiw(control, isView){
    var view = document.getElementById("loading-area");

    if(control === "simimg"){
        if(isView){
            view.style.display = "flex";            
        }
        else{
            view.style.display = "none";
        }
    }
    
    if(control === "train"){        
        if(isView){
            view.style.display = "flex";
            
        }
        else{
            view.style.display = "none";
        }
    }

    if(control === "predict"){
        if(isView){
            view.style.display = "flex";            
        }
        else{
            view.style.display = "none";
        }
    }
    
}

// 원본 이미지 & 라벨링 이미지 전송하기.
function labelTag(){
    try {
        if(user_phone.length == 0){
            alert("로그인 세션이 만료되었습니다.");
            return;
        }
    } catch (error) {
        console.error(error);
        alert("로그인 세션이 만료되었습니다.");
        return;     
    }

    if(isDivideVideo == false){
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if(isclickTrainImage == false){
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return ;
    }

    if(isTrainOK){
        alert("이미 학습을 완료했습니다. 예측을 통해 레이블링을 진행해주세요.");
        return;
    }
    if (document.querySelector("#label_name").textContent == "") {
        alert("레이블링의 object를 정의해주세요.");
        return;
    }
    
    console.log("$ train!");
    
    loadingVeiw("train", true);
    setControlBarThree()
    // 1. orign canvas to file
    var originCanvas = document.getElementById("imgViewer");
    var originUrl = originCanvas.toDataURL("image/jpeg");
    var originBlob = dataURItoBlob(originUrl, "frame-" + previousCanvasId); 

    // 2. Draw canvas to file
    var labelCanvas = document.getElementById("canvas-drawing-" + previousCanvasId);
    console.log("please previousCanvasId", previousCanvasId);
    var labelUrl = labelCanvas.toDataURL("image/jpeg");
    var labelBlob = dataURItoBlob(labelUrl, "canvas-drawing-" + previousCanvasId);
    nowtimeis = returnDate
    // 3. FormData
    var frm = new FormData();
    frm.append("img", originBlob);
    frm.append("label", labelBlob);
    frm.append("user_id", user_phone);
    frm.append("timestamp", nowtimeis);

    axios.post(photovleML + '/model/train', frm, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
    })
    // .then((response) => {
    //     if(response.status == 200){
    //         isTrainOK = true;
    //         console.log("4. Success Train");
    //         console.log(response);
    //         loadingVeiw("train", false);
            
    //     }        
    // })
    // .catch(function (error) {
    //     console.log("Train Fail : ", error);
    //     alert("학습에 실패하였습니다. 서버를 확인해주세요.");
    // });

    // // predicttime = nowtime();
    // predicttime = returnDate
    // loadingVeiw("predict", true);
    // var frm = new FormData();
    // frm.append("user_id", user_phone);
    // frm.append("timestamp", predicttime);

    // axios.post(photovleML + '/data/video/testing', frm, {
    //     headers: {
    //     'Content-Type': 'multipart/form-data'
    //     }
    // })
    .then((response) => {
        console.log("5. predicted 8 image");
        console.log(response); 
        frames = [];
        const select = document.querySelector("select");   
           
        for(i=1;i<9;i++)
        {
            var predictedimg = response.data.origin_data["video-frame-" + i + ".png"]
            if(response.data.length == 0){
                alert("예측된 이미지를 못 가져왔어요. 다시 시도해주세요.");
                return;
            }
            const predicteddata = "data:image/png;base64," + predictedimg; // base64 데이터 url 정보
            
            
            fetch(predicteddata)
            .then(response => response.blob())
            .then(blob =>{
                Promise.all([
                    createImageBitmap(blob)
                ]).then(function(result){
                    frames.push(result[0]);
                    console.log("predicted image list create")
                    const imageItem = document.createElement("li");
                    imageItem.setAttribute("id", "frame-" + (preindex + 1));
                    imageItem.setAttribute("class", "image-item-predicted");
                    
                    imageItem.onclick = onClickSpecificFrame;

                    // canvas 태그
                    const imageCanvas = document.createElement("canvas");
                    imageCanvas.width = 120;
                    imageCanvas.height = 100;
                    const imageCtx = imageCanvas.getContext("2d");
                    imageCtx.drawImage(result[0], 0, 0, 120, 100);
                

                    // p 태그
                    const imageId = document.createElement("p");
                    imageId.textContent = "frame-" + (preindex + 1);

                    imageItem.append(imageCanvas);
                    imageItem.append(imageId);

                    // ul 태그 추가
                    const imageListUl = document.getElementById("image-list-predicted");
                    imageListUl.append(imageItem);


                    
                    setInformationTotalFrmae(preindex);
                    createCanvas(result[0].width, result[0].height);
                    preindex = preindex + 1;
                    return result[0]
                });
            });
        }
        loadingVeiw("predict", false);
        
    })
    .then(_ => {
        //5번 째 예측
        infor_width = 32;
        infor_height = 10;
        infor_number = 5;
        infor_title = "동영상 변환";
        infor_content = "해당 버튼을 눌러 모자이크 처리된 영상을 받습니다."
        notice_content = "";
        open_black_background();
        make_markedbox(".downloadvideo");
    })


}

function pageNumberview(){
    document.getElementById("page-number").innerHTML=pagenumber;
}

function paginationRight(){
    try {
        if(user_phone.length == 0){
            alert("로그인 세션이 만료되었습니다.");
            return;
        }
    } catch (error) {
        console.error(error);
        alert("로그인 세션이 만료되었습니다.");
        return;     
    }

    if(isDivideVideo == false){
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if(isclickTrainImage == false){
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return ;
    }
    if (document.querySelector("#label_name").textContent == "") {
        alert("레이블링의 object를 정의해주세요.");
        return;
    }
    
    console.log("6. pagination");
    var predictedImageEight = [];
    // 1. orign canvas to file
    nowtimeis = returnDate
    // 3. FormData
    
    var frm = new FormData();
    // 2. Draw canvas to file
    for(i=(pagenumber-1)*8+1;i<pagenumber*8+1;i++)
    {
        var labelCanvas = document.getElementById("canvas-drawing-" + i);
        console.log(i);
        var labelUrl = labelCanvas.toDataURL("image/jpeg");
        var labelBlob = dataURItoBlob(labelUrl, "canvas-drawing-" + i);
        var imgsname = "save_imgs"+(i);
        console.log(imgsname);
        frm.append(imgsname, labelBlob);
    }
    
    frm.append("user_id", user_phone);
    frm.append("timestamp", nowtimeis);
    frm.append("current_page", pagenumber);
    
    frm.append("flag", true);
    console.log(pagenumber)
    var completeframe = document.getElementById('frame-' + (pagenumber-1));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber+1));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber+2));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber+3));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber+4));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber+5));    
    completeframe.remove();
    var completeframe = document.getElementById('frame-' + (pagenumber+6));    
    completeframe.remove();
    
    pagenumber = pagenumber + 1;
    axios.post(photovleML + '/data/video/paging', frm, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
    })
    
    .then((response) => {
        
        console.log("8. next predicted 8 image recevie");
        console.log(response); 
        frames = [];
        const select = document.querySelector("select");    
        for(i=(pagenumber-1)*8+1;i<pagenumber*8+1;i++)
        {
            console.log(i)
            var predictedimg = response.data.origin_data["video-frame-" + i + ".png"]
            if(response.data.length == 0){
                alert("예측된 이미지를 못 가져왔어요. 다시 시도해주세요.");
                return;
            }
            const predicteddata = "data:image/png;base64," + predictedimg; // base64 데이터 url 정보
            
            
            fetch(predicteddata)
            .then(response => response.blob())
            .then(blob =>{
                Promise.all([
                    createImageBitmap(blob)
                ]).then(function(result){
                    frames.push(result[0]);
                    console.log("predicted image list create")
                    const imageItem = document.createElement("li");
                    imageItem.setAttribute("id", "frame-" + (preindex + 1));
                    imageItem.setAttribute("class", "image-item-predicted");
                    
                    imageItem.onclick = onClickSpecificFrame;

                    // canvas 태그
                    const imageCanvas = document.createElement("canvas");
                    imageCanvas.width = 120;
                    imageCanvas.height = 100;
                    const imageCtx = imageCanvas.getContext("2d");
                    imageCtx.drawImage(result[0], 0, 0, 120, 100);
                

                    // p 태그
                    const imageId = document.createElement("p");
                    imageId.textContent = "frame-" + (preindex + 1);

                    imageItem.append(imageCanvas);
                    imageItem.append(imageId);

                    // ul 태그 추가
                    const imageListUl = document.getElementById("image-list-predicted");
                    imageListUl.append(imageItem);


                    
                    setInformationTotalFrmae(preindex);
                    createCanvas(result[0].width, result[0].height);
                    preindex = preindex + 1;
                    return result[0]
                });
            });
        }
        loadingVeiw("predict", false);




    })
    .catch(function (error) {
        console.log("Train Fail : ", error);
        alert("학습에 실패하였습니다. 서버를 확인해주세요.");
    });

}

function predictObject(){
    try {
        if(user_phone.length == 0){
            alert("로그인 세션이 만료되었습니다.");
            return;
        }
    } catch (error) {
        console.error(error);
        alert("로그인 세션이 만료되었습니다.");
        return;     
    }   

    // 비디오 업로드 사전 체크
    if(isDivideVideo == false){
        alert("비디오 업로드 및 분할을 먼저 진행해주세요.");
        return;
    }
    if(isclickTrainImage == false){
        alert("학습할 이미지 Frame을 선택 후 라벨링을 진행해주세요.");
        return ;
    }
    if(isTrainOK == false){
        alert("모델 학습을 먼저 진행해주세요.");
        return ;
    }

    if(isTrainOK){
        console.log("$ predicting!");
        bErasing = false;
        // context.strokeStyle = currentSelectedColor;
        loadingVeiw("predict", true);
        var originCanvas = document.getElementById("imgViewer");
        var originUrl = originCanvas.toDataURL("image/jpeg");
        var originBlob = dataURItoBlob(originUrl, "frame-" + previousCanvasId);

        var labelCanvas = document.getElementById("canvas-drawing-" + previousCanvasId);
        // labelCanvas.clearRect(0, 0, originCanvas.width, originCanvas.height);
        console.log("please previousCanvasId", previousCanvasId);
        var labelUrl = labelCanvas.toDataURL("image/jpeg");
        var labelBlob = dataURItoBlob(labelUrl, "canvas-drawing-" + previousCanvasId);
        
        var frm = new FormData();
        
        frm.append("user_id", user_phone);
        frm.append("img", originBlob);
        frm.append("label", labelBlob);
        
        axios.post(photovleML + '/model/predict', frm, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(function (response) {
            console.log("Success predict", response);
            console.log("response data : ", response.data);
        
            var arr = response.data;
            if(arr.length == 0){
                alert("학습이 잘못되었습니다. 다시 시도해주세요.");
                return;
            }

            var canvas1 = document.getElementById("canvas-drawing-" + previousCanvasId);
            
            var ctx = canvas1.getContext("2d");
            ctx.fillStyle = currentSelectedColor;
            ctx.strokeStyle = currentSelectedColor;
            ctx.lineWidth = 5;
            ctx.closePath();
            
            for(var i = 0; i < arr.length; i++){
                var x = arr[i][0];
                var y = arr[i][1];

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x+1, y+1);
                ctx.stroke();
            }
            ctx.closePath();
            ctx.beginPath();
            loadingVeiw("predict", false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }else{
        console.log("not predict!");
        alert("예측에 실패하였습니다. 서버를 확인해주세요.");
        return ;
    }
}

function predictvideo(){
    console.log("$ predict Video");
    loadingVeiw("train", true);
    axios({
        url: photovleML + '/model/video1',
        method: "POST",
        responseType: "blob", 
        data: {
            "user_id": user_phone,
            "timestamp": nowtimeis
        }
    })
    .then(function (response) {
        if(response.status == 200){
            const url = window.URL.createObjectURL(new Blob([response.data], {type: "video/avi"}));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', "video.avi");
            document.body.appendChild(link);
            link.click();
            loadingVeiw("train", false);
        }
    })
    .catch(function (error) {
        console.log("Train Fail : ", error);
    });
}

// 그림판 상단 컬러 선택 버튼 생성
initDrawingBoard();
baseImageViewer();
loadingRecommendImage();

// 파일 업로드 버튼 이벤트

const uploadVideoButton = document.querySelector("#upload_video");
uploadVideoButton.addEventListener("click", loadUploadVideo);

// 이미지 분할 아이콘 버튼 이벤트
//const imgSplittingButton = document.getElementById("divide_video");
//imgSplittingButton.onclick = async (evt) => divideVideo();

// 모달 이벤트
const modal = document.querySelector('.modal');

const btnOpenPopup = document.querySelector('.btn-open-popup');
btnOpenPopup.addEventListener('click', modalOpen)

const closeBtn = modal.querySelector(".close-area");
closeBtn.addEventListener('click', modalOff);



function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY }
    }
}


//redraw

async function redraw(zoom, predefinedCanvas, combinedCanvas, context, cameraOffset) {

    const frame = frames[previousCanvasId];
    let w = frame.width;
    let h = frame.height;


    //축소 최대 크기

    //Image Area
    canvasImage.width = fixed_w;
    canvasImage.height = fixed_h;


    ctxImage.translate(0, 0)
    ctxImage.scale(zoom, zoom)
    ctxImage.translate(cameraOffset.x, cameraOffset.y)
    ctxImage.drawImage(frame, 0, 0);


    // // //Drawing Area

    predefinedCanvas.width = fixed_w;
    predefinedCanvas.height = fixed_h;

    context.clearRect(0, 0, fixed_w, fixed_h)
    context.translate(0, 0)
    context.scale(zoom, zoom)
    context.translate(cameraOffset.x, cameraOffset.y)
    context.drawImage(combinedCanvas, 0, 0);

}

//selected modal open

function selectedmodalopen(){
    let selectedbutton = document.getElementById('selectedbutton');
    selectedbutton.click();
}

function open_black_background(){
    var backdiv = document.createElement('div');
    backdiv.className = "bb_modal";
    document.getElementsByTagName('body')[0].appendChild(backdiv)
    // document.get('colors').appendChild(swatchbox);
}

function open_arrow(top, left){
    var firstarrow = document.createElement('div');
    firstarrow.className = "arrow arrow-first";
    document.getElementsByTagName('body')[0].appendChild(firstarrow)
    var secondarrow = document.createElement('div');
    secondarrow.className = "arrow arrow-second";
    document.getElementsByTagName('body')[0].appendChild(secondarrow)

    var arrow = document.getElementsByClassName('arrow');
    for(let i=0; i<2; i++){
        arrow[i].style.top = String(top - 20) + "px";
        arrow[i].style.left = String(left - 20) + "px";
    }
    
}

function revise_inforBox(infor_top, infor_left, infor_width, infor_height, infor_title, infor_number, infor_content, notice_content ){
    let inforbox = document.getElementsByClassName('inforBox')[0];
    inforbox.style.top = String(infor_top) + "px";
    inforbox.style.left = String(infor_left) + "px";
    inforbox.style.width = String(infor_width) + "rem";
    inforbox.style.height = String(infor_height) + "rem";
    let infornumber = document.getElementsByClassName('inforNum')[0];
    infornumber.innerHTML = String(infor_number);
    let infortitle = document.getElementsByClassName('inforTitle')[0];
    infortitle.innerHTML = String(infor_title);
    let inforcontent = document.getElementsByClassName('inforContent')[0];
    inforcontent.innerHTML = String(infor_content);
    let noticecontent = document.getElementsByClassName('noticeContent')[0];
    noticecontent.innerHTML = String(notice_content);
    
}


function make_markedbox(className){
    let selectdiv = document.querySelector(className);
    let imgRect =selectdiv.getBoundingClientRect();

    console.log(imgRect)
    var markedbox = document.createElement('div');
    markedbox.className = "markedbox";
    markedbox.style.zIndex = "20";
    markedbox.style.top = String(imgRect.top) + "px";
    markedbox.style.left = String(imgRect.left) + "px";
    markedbox.style.width = String(imgRect.width) + "px";
    markedbox.style.height = String(imgRect.height) + "px";
    markedbox.style.cursor = "pointer";
    markedbox.onclick = allclose;

    document.documentElement.style.setProperty('--ani-top_start', String(imgRect.top - 50) + "px" );
    document.getElementsByTagName('body')[0].appendChild(markedbox);

    const arrow_top = imgRect.top;
    const arrow_left = imgRect.left + (imgRect.width/2);
    open_arrow(arrow_top, arrow_left);

    const infor_top = imgRect.top;
    const infor_left = imgRect.right + 20;

    revise_inforBox(infor_top, infor_left, infor_width, infor_height, infor_title, infor_number, infor_content, notice_content)
    inforboxopen();

}

function allclose(){
    console.log("hi")
    const backdiv = document.getElementsByClassName('bb_modal')[0];
    const arrow = document.getElementsByClassName('arrow');
    const markedbox = document.getElementsByClassName('markedbox')[0];
    backdiv.remove();
    for(let i=0; i<2; i++){
        arrow[0].remove();
    }
    markedbox.remove();


    const inforbox = document.getElementsByClassName('inforBox')[0];
    inforbox.style.display = 'none';

    if(startThree){
        //4번 째 안내
        startThree = false
        infor_width = 32;
        infor_height = 10;
        infor_number = 4;
        infor_title = "학습 및 예측";
        infor_content = "라벨링이 끝나면 해당 버튼을 눌러 학습을 진행해주세요."
        open_black_background();
        make_markedbox("#labelTagbutton");
    }
}

function inforboxopen(){
    const inforbox = document.getElementsByClassName('inforBox')[0];
    inforbox.style.display = 'block';
}

open_black_background();
make_markedbox(".input-file");