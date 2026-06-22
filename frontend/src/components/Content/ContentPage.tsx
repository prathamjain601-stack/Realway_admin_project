import React, { useState } from 'react';
import ContentView from './ContentView';
import PostEditor from './PostEditor';

const ContentPage = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editPostId, setEditPostId] = useState<number | null>(null);

  if (view === 'editor') {
    return (
      <PostEditor
        postId={editPostId}
        onBack={() => {
          setView('list');
          setEditPostId(null);
        }}
        onSaved={() => setView('list')}
      />
    );
  }

  return (
    <ContentView
      onNewPost={() => {
        setEditPostId(null);
        setView('editor');
      }}
      onEditPost={(id) => {
        setEditPostId(id);
        setView('editor');
      }}
    />
  );
};

export default ContentPage;
