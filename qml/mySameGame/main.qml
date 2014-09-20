import QtQuick 1.1
import "content"
import "content/samegame.js" as SameGame

Rectangle {
    id: screen
    width: 400; height: 520

    SystemPalette { id: activePalette }

    Item {
        width: parent.width
        anchors { top: parent.top; bottom: toolBar.top }

        Image {
             id: background
             anchors.fill: parent
             source: "content/pics/back3.jpg"
             fillMode: Image.PreserveAspectCrop
        }
    }

    Item {
        id: gameCanvas

        property int score: 0
        property int blockSize: 40

        width: parent.width - (parent.width%blockSize)
        height:parent.height- (parent.height%blockSize)
        anchors.centerIn: parent

        MouseArea{
            anchors.fill: parent
            onClicked: SameGame.handleClick(mouse.x, mouse.y)
        }
    }


    Dialog{
        id:dialog
        anchors.centerIn: parent
        z:100   //默认为0，设为100，保证在其他元素之上
    }
    Dialog{
        id:nameInputDialog
        anchors.centerIn: parent
        z:100

        onClosed:{
            if(nameInputDialog.inputText != "")
                SameGame.saveHighScore(nameInputDialog.inputText);
        }
    }

    Rectangle{
        id:toolBar
        width: parent.width; height: 30
        color: activePalette.window
        anchors.bottom: screen.bottom
        Button{
            id:newGame
            anchors{left: parent.left; verticalCenter: parent.verticalCenter }
            text: "New Game"
            onClicked: SameGame.startNewGame()
        }
        Text{
            id:score
            anchors{right:parent.right; verticalCenter: parent.verticalCenter }
            text:"Score: "+gameCanvas.score
        }
    }
}
