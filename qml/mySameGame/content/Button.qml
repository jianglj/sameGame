import QtQuick 1.1

Rectangle {
    id:container

    property string text: "Button"

    signal clicked

    width: buttonLabel.width+20; height: buttonLabel.height+5
    border.width: 1; border.color: Qt.darker(activePalette.button)
    smooth:true
    radius: 8

    //填成渐变色
    gradient: Gradient{     //大小写很重要。。有什么差别？
        GradientStop{
            position: 0.0
            color:{
                if(MouseArea.pressed)
                    return activePalette.dark
                else
                    return activePalette.light
            }
        }
        GradientStop{position: 1.0; color: activePalette.button}
    }

    MouseArea{
        id: mouseArea
        anchors.fill: parent
        onClicked: container.clicked();
    }

    Text{
        id: buttonLabel
        anchors.centerIn: container
        color: activePalette.buttonText
        text: container.text
    }
}
