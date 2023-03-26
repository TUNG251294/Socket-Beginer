import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import './App.css';

const host = "http://localhost:3000";

function App() {
  const [mess, setMess] = useState([]);
  const [message, setMessage] = useState('');
  const [id, setId] = useState();

  const socketRef = useRef();

  // lắng nghe sự kiện được phát ra từ server để nhận tin nhắn khi có tin nhắn mới
  useEffect(() => {
    socketRef.current = socketIOClient.connect(host);
  
    socketRef.current.on('getId', data => {
      setId(data);
    }); // phần này đơn giản để gán id cho mỗi phiên kết nối vào page. Mục đích chính là để phân biệt đoạn nào là của mình đang chat.

    socketRef.current.on('sendDataServer', dataGot => {
      setMess(oldMsgs => [...oldMsgs, dataGot.data]);
    }); // mỗi khi có tin nhắn thì mess sẽ được render thêm 

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Khi submit nút gửi, chúng ta cần phát ra sự kiện để gửi dữ liệu tới server
  const sendMessage = () => {
    if (message !== null) {
      const msg = {
        content: message, 
        id: id
      };
      socketRef.current.emit('sendDataClient', msg);
 
      /* Khi emit('sendDataClient') bên phía server sẽ nhận được sự kiện có tên 'sendDataClient' và handle như câu lệnh trong file index.js
      socket.on("sendDataClient", function(data) { // Handle khi có sự kiện tên là sendDataClient từ phía client
        socketIo.emit("sendDataServer", { data });// phát sự kiện  có tên sendDataServer cùng với dữ liệu tin nhắn từ phía server
      })
      */
      setMessage('');
    }
  };

  // Render từng khung tin nhắn nhé, chúng ta sẽ gán thêm class phục vụ 
  // cho việc chút nữa style lại để phân biệt cái nào là của mình chat
  const renderMess = mess.map((m, index) => (
    <div 
      key={index} 
      className={`${m.id === id ? 'your-message' : 'other-people'} chat-item`}
    >
      {m.content}
    </div>
  ));
  
  return (
    <div className="box-chat">
      <div className="box-chat_message">
        {renderMess}
      </div>

      <div className="send-box">
        <textarea 
          value={message}  
          onKeyDown={(e) => e.keyCode === 13 && sendMessage()} // gửi tin nhắn khi nhấn Enter
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Nhập tin nhắn ..." 
        />
        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
