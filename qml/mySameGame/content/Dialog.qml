import QtQuick 1.1

Rectangle {
    id:container

    property string inputText: textInput.text
    signal closed

    function show(text) {
         dialogText.text = text;
         container.opacity = 1;
         textInput.opacity = 0;
    }

    function showWithInput(text){
        show(text);
        textInput.opacity=1;
        textInput.focus=true;
        textInput.text=""
    }

    function hide() {
        textInput.focus = false;
         container.opacity = 0;
         container.closed();
    }

    width: dialogText.width + textInput.width + 20
    height: dialogText.height + 20
    opacity: 0
    visible: opacity > 0

    Text {
        id: dialogText
        anchors{ verticalCenter: parent.verticalCenter;
                left:parent.left;
                leftMargin: 10 }
        text: ""
    }

    TextInput{
        id:textInput
        anchors{
            verticalCenter: parent.verticalCenter;
            left: dialogText.right
        }
        width: 80
        text: ""

        onAccepted: container.hide() //回车后关闭对话框
    }

    MouseArea {
        anchors.fill: parent
        onClicked: {
            if(textInput.text == "" && textInput.opacity > 0)
                textInput.openSoftwareInputPanel();
            else
                hide();
        }
    }
}
