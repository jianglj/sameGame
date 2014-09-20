//var blockSize = 40; //移到qml中去
var maxColumn = 10;
var maxRow = 15;
var maxIndex = maxColumn * maxRow;
var board = new Array(maxIndex);
var component;
var scoresURL = "";
var gameDuration;

//Index function used instead of a 2D array
function index(column, row) {
    return column + (row * maxColumn);
}

function startNewGame() {
    //Delete blocks from previous game
    for (var i = 0; i < maxIndex; i++) {
        if (board[i] != null)
            board[i].destroy();
    }

    //Calculate board size 计算界面的尺寸
    maxColumn = Math.floor(background.width / gameCanvas.blockSize);///////////？？
    maxRow = Math.floor(background.height / gameCanvas.blockSize);
    maxIndex = maxRow * maxColumn;

    //关闭对话框
    nameInputDialog.hide();
    dialog.hide();

    //Initialize Board
    board = new Array(maxIndex);
    gameCanvas.score=0;
    for (var column = 0; column < maxColumn; column++) {
        for (var row = 0; row < maxRow; row++) {
            board[index(column, row)] = null;
            createBlock(column, row);
        }
    }
    gameDuration = new Date();
}

function createBlock(column, row) {
    if (component == null)
        component = Qt.createComponent("content/BoomBlock.qml");

    // Note that if Block.qml was not a local file, component.status would be
    // Loading and we should wait for the component's statusChanged() signal to
    // know when the file is downloaded and ready before calling createObject().
    if (component.status == Component.Ready) {
        var dynamicObject = component.createObject(gameCanvas);
        if (dynamicObject == null) {
            console.log("error creating block");
            console.log(component.errorString());
            return false;
        }

        dynamicObject.type = Math.floor(Math.random() * 4); //type随机

        dynamicObject.x = column * gameCanvas.blockSize;
        dynamicObject.y = row * gameCanvas.blockSize;
        dynamicObject.width = gameCanvas.blockSize;
        dynamicObject.height = gameCanvas.blockSize;
        dynamicObject.spawned = true;
        board[index(column, row)] = dynamicObject;
    } else {
        console.log("error loading block component");
        console.log(component.errorString());
        return false;
    }
    return true;
}






var fillFound; //Set after a floodFill call to the number of blocks found
var tempFound;
var tempCleanFound;
var floodBoard; //Set to 1 if the floodFill reaches off that node
var column_last,row_last; //保存上一次的坐标   第一次？

function handleClick(xPos, yPos) {
    var column = Math.floor(xPos / gameCanvas.blockSize); //floor 舍去法取整
    var row = Math.floor(yPos / gameCanvas.blockSize);
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return;
    if (board[index(column, row)] == null)
        return;

   //添加中间状态
    if(!board[index(column,row)].temp){       //没有被选中过
        tempFill_clean(column_last,row_last,-1);    //上一次的清掉
        column_last=column;
        row_last=row;
//        board[index(column,row)].temp=true;     //这一次的temp
        tempFill(column,row,-1);
        return;
    }
     else{                                     //上一次选的就是它（相邻）

        //board[index(column,row)].temp=false;
    }

    //If it's a valid block, remove it and all connected (does nothing if it's not connected)
    floodFill(column, row, -1);
    if (fillFound <= 0)
        return;
    gameCanvas.score += (fillFound - 1) * (fillFound - 1);
    shuffleDown();
    victoryCheck();
}

function tempFill(column,row,type){
    if (board[index(column, row)] == null)
        return;
    var first = false;
    if (type == -1) {   //第一次调用，区别于递归过程
        first = true;
        type = board[index(column, row)].type;

        //Flood fill initialization
        tempFound = 0;   //初始化 相邻的个数，算自己
        floodBoard = new Array(maxIndex);//新建一个溢出格数组，找到的标为1
    }
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return;
    if (floodBoard[index(column, row)] == 1 || (!first && type != board[index(column, row)].type))
        return;  //该格已被检索或者类型不同则结束
    floodBoard[index(column, row)] = 1;
    tempFill(column + 1, row, type);
    tempFill(column - 1, row, type);
    tempFill(column, row + 1, type);
    tempFill(column, row - 1, type);
    if (first == true && tempFound == 0)
        return;     //单格的不做处理
    board[index(column, row)].temp = true;
    //board[index(column, row)] = null; //将该格清空
    tempFound += 1; //最后会+1，因此算上自己这格
}

function tempFill_clean(column,row,type){
    if (board[index(column, row)] == null)
        return;
    var first = false;
    if (type == -1) {   //第一次调用，区别于递归过程
        first = true;
        type = board[index(column, row)].type;

        //Flood fill initialization
        tempCleanFound = 0;   //初始化 相邻的个数，算自己
        floodBoard = new Array(maxIndex);//新建一个溢出格数组，找到的标为1
    }
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return;
    if (floodBoard[index(column, row)] == 1 || (!first && type != board[index(column, row)].type))
        return;  //该格已被检索或者类型不同则结束
    floodBoard[index(column, row)] = 1;
    tempFill_clean(column + 1, row, type);
    tempFill_clean(column - 1, row, type);
    tempFill_clean(column, row + 1, type);
    tempFill_clean(column, row - 1, type);
    if (first == true && tempCleanFound == 0)
        return;     //单格的不做处理
    board[index(column, row)].temp = false;
    //board[index(column, row)] = null; //将该格清空
    tempCleanFound += 1; //最后会+1，因此算上自己这格

}



function floodFill(column, row, type) {
    if (board[index(column, row)] == null)
        return;
    var first = false;
    if (type == -1) {   //第一次调用，区别于递归过程
        first = true;
        type = board[index(column, row)].type;

        //Flood fill initialization
        fillFound = 0;   //初始化 相邻的个数，算自己
        floodBoard = new Array(maxIndex);//新建一个溢出格数组，找到的标为1
    }
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return;
    if (floodBoard[index(column, row)] == 1 || (!first && type != board[index(column, row)].type))
        return; //该格已被检索或者类型不同则结束
    floodBoard[index(column, row)] = 1;//
    floodFill(column + 1, row, type);
    floodFill(column - 1, row, type);
    floodFill(column, row + 1, type);
    floodFill(column, row - 1, type);
    if (first == true && fillFound == 0)
        return;     //Can't remove single blocks
    board[index(column, row)].dying = true;
    board[index(column, row)] = null; //将该格清空
    fillFound += 1; //最后会+1，因此算上自己这格
}

function shuffleDown() {
    //Fall down
    for (var column = 0; column < maxColumn; column++) {
        var fallDist = 0;
        for (var row = maxRow - 1; row >= 0; row--) {
            if (board[index(column, row)] == null) {
                fallDist += 1;
            } else {
                if (fallDist > 0) {
                    var obj = board[index(column, row)];
                    obj.y += fallDist * gameCanvas.blockSize;
                    board[index(column, row + fallDist)] = obj;
                    board[index(column, row)] = null;
                }
            }
        }
    }

    //Fall to the left
    fallDist = 0;
    for (column = 0; column < maxColumn; column++) {
        if (board[index(column, maxRow - 1)] == null) {
            fallDist += 1;
        } else {
            if (fallDist > 0) {
                for(row=maxRow-1;row>=0;row--) //...简化后的..好像也没简化 - -# 而且传说for从0开始++比较快
                {
                    obj = board[index(column, row)];
                    if(obj == null)
                        break;
                    obj.x -= fallDist * gameCanvas.blockSize;
                    board[index(column - fallDist, row)] = obj;
                    board[index(column, row)] = null;
                }

                /*for (row = 0; row < maxRow; row++) {   //可更简
                    obj = board[index(column, row)];
                    if (obj == null)
                        continue;
                    obj.x -= fallDist * gameCanvas.blockSize;
                    board[index(column - fallDist, row)] = obj;
                    board[index(column, row)] = null;
                }*/
            }
        }
    }
}

function victoryCheck() {
    //Award bonus points if no blocks left
    var deservesBonus = true;
    /*for (var column = maxColumn - 1; column >= 0; column--) //想干什么？
        if (board[index(column, maxRow - 1)] != null)
        deservesBonus = false;
    if (deservesBonus)     // board[index(0,maxRow-1)]==null 就说明没有剩下了
        gameCanvas.score += 500;*/

    if(board[index(0,maxRow-1)] != null) //直接判断左下角的不就完了？
        deservesBonus = false;
    else gameCanvas.score += 500;

    //Check whether game has finished
    if (deservesBonus || !(floodMoveCheck(0, maxRow - 1, -1)))  //如果结束。   左下角，type -1表示第一次调用 ？
        {
        gameDuration =new Date() - gameDuration;  //gameDuration是持续时间？
        nameInputDialog.showWithInput("You won!Please enter your name:");
        }
}

//only floods up and right, to see if it can find adjacent same-typed blocks
function floodMoveCheck(column, row, type) {    //返回能否继续
    if (column >= maxColumn || column < 0 || row >= maxRow || row < 0)
        return false;
    if (board[index(column, row)] == null)
        return false;
    var myType = board[index(column, row)].type;
    if (type == myType)
        return true;
    return floodMoveCheck(column + 1, row, myType) || floodMoveCheck(column, row - 1, board[index(column, row)].type);//和myType有什么差别
}

function saveHighScore(name){
 //   if(scoresURL != "")
 //       sendHighScore(name);

    var db = openDatabaseSync("SameGameScores","1.0","Local SameGame High Scores",100);
    var dataStr = "INSERT INTO Scores VALUES(?,?,?,?)";
    var data = [name,gameCanvas.score,maxColumn+"x"+maxRow,Math.floor(gameDuration/1000)];
    db.transaction(
        function(tx){
            tx.executeSql('CREATE TABLE IF NOT EXISTS Scores(name TEXT,score NUMBER,gridSize TEXT,time NUMBER)');
            tx.executeSql(dataStr,data);                                                  //insert

            var rs = tx.executeSql('SELECT * FROM Scores WHERE gridSize = "'
                                   +maxColumn+"x"+maxRow+'" ORDER BY score desc LIMIT 10'); //select,order
            var r = "\nHIGH SCORES for this grid size\n\n"
            if(rs.rows.length<10)
                for(var i = 0;i<rs.rows.length;i++){
                    r += (i+1) + ". " + rs.rows.item(i).name + ' got '
                            + rs.rows.item(i).score + ' points in '
                            + rs.rows.item(i).time + ' seconds.'+rs.rows.item(i).gridSize+'\n';
                }
            else
                for(var i = 0;i<10;i++){
                    r += (i+1) + ". " + rs.rows.item(i).name + ' got '
                            + rs.rows.item(i).score + ' points in '
                            + rs.rows.item(i).time + ' seconds.'+rs.rows.item(i).gridSize+'\n';
                }
            //if(rs.rows.length == 10)
            //    highScoreBar = rs.rows.item(9).score;
            dialog.show(r);
        }
    )
}

/*function sendHighScore(name) {
}
*/
