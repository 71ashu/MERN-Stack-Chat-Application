import { Transition, Dialog } from "@headlessui/react";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import Avatar from './Avatar';

const SearchUser = ({selectedUser, setSelectedUser}) => {

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`/users`, {
      params: {
        search
      }
    }).then(res => setUsers(search ? res.data : []));
  }, [search]);

  return (
    <>
      <label className="block">Select User</label>
      <div className="mt-2">
        <input
          type="text"
          className="block border rounded-md p-2 w-full"
          placeholder="Search for a user"
          value={search}
          onChange={ev => setSearch(ev.target.value)}
        />
      </div>
      {selectedUser && (
        <div className="bg-slate-300 p-1 text-sm mt-2 rounded-md inline-flex">
          {selectedUser.username}
        </div>
      )}
      <div className="overflow-auto mt-4">
        {users.map(({username, _id}, index) => (
          <div key={index} className="flex items-center p-3 rounded border cursor-pointer" onClick={() => setSelectedUser(users[index])}>
            <Avatar userId={_id} username={username} />
            <span className="ml-2 mr-2 flex-1">{username}</span>
            <span className="text-blue-600 text-sm">ADD</span>
          </div>
        ))}
      </div>
    </>
  );
};

const NewChatForm = ({ userId, showForm, setShowForm }) => {

  const [selectedUser, setSelectedUser] = useState(null);

  const closeModal = () => {
    setShowForm(false);
  };

  const openModal = () => {
    setShowForm(true);
  };

  const createChat = (ev) => {
    ev.preventDefault();
    axios.post('/chat', {
      userId: selectedUser._id
    }).then(res => res.data).then(console.log)
  }
  
  return (
    <>
      <Transition appear show={showForm} as={Fragment}>
        <Dialog as="div" className="relative z-10 max-h-60" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    New Conversation
                  </Dialog.Title>
                  <div className="mt-2">
                    <form onSubmit={createChat}>
                      <SearchUser selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Create Conversation
                        </button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default NewChatForm;
