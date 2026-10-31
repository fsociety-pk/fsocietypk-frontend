import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Trash2, Undo2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MemberAvatar from './MemberAvatar';

export default function ProfilePhotoEditor({ saved, preview, username, disabled, onChange, onBusyChange }: {
  saved?: string; preview: string | null; username: string; disabled: boolean;
  onChange: (value: string | null) => void; onBusyChange: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const version = useRef(0);
  const [reading, setReading] = useState(false);
  const current = preview === null ? saved : preview;
  useEffect(() => () => { version.current++; onBusyChange(false); }, [onBusyChange]);
  const prepare = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { toast.error('Choose a JPG, PNG, WebP, or GIF image.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Choose an image smaller than 5 MB.'); return; }
    const request = ++version.current;
    setReading(true); onBusyChange(true);
    const done = (message?: string) => {
      if (request !== version.current) return;
      setReading(false); onBusyChange(false);
      if (message) toast.error(message);
    };
    const reader = new FileReader();
    reader.onerror = () => done('This image could not be read.');
    reader.onload = () => {
      if (request !== version.current) return;
      const image = new Image();
      image.onerror = () => done('This image could not be opened.');
      image.onload = () => {
        if (request !== version.current) return;
        try {
          const size = Math.min(image.width, image.height);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 400;
          const context = canvas.getContext('2d');
          if (!context || !size) { done('This image could not be prepared.'); return; }
          context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 400, 400);
          onChange(canvas.toDataURL('image/jpeg', .85));
          done();
        } catch { done('This image could not be prepared.'); }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const change = (value: string | null) => {
    version.current++; setReading(false); onBusyChange(false); onChange(value);
  };
  return <fieldset className="profile-photo-editor" disabled={disabled}>
    <legend>Profile photo</legend>
    <div className="profile-photo-editor-body">
      <div className="profile-photo-preview"><MemberAvatar src={current} username={username} /></div>
      <div className="profile-photo-editor-copy">
        <p id="profile-photo-help">Add a photo, replace it, or return to your default avatar.</p>
        <div className="profile-photo-actions">
          <button type="button" className="btn-outline" disabled={reading} onClick={() => input.current?.click()}><ImagePlus size={16} />{current ? 'Replace photo' : 'Add photo'}</button>
          {!!current && <button type="button" className="btn-ghost profile-remove-photo" onClick={() => change('')}><Trash2 size={16} />Remove photo</button>}
          {preview !== null && <button type="button" className="btn-ghost" onClick={() => change(null)}><Undo2 size={15} />Undo photo change</button>}
        </div>
        <input ref={input} type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Upload profile photo" aria-describedby="profile-photo-help" onChange={prepare} />
        <small>JPG, PNG, WebP or GIF, up to 5 MB. Photos are cropped to a square.</small>
        <p className="profile-photo-status" role="status">{reading ? 'Preparing photo…' : preview === '' ? 'Photo will be removed when you save changes.' : preview !== null ? 'New photo ready. Save changes to apply it.' : 'Photo changes apply when you save your profile.'}</p>
      </div>
    </div>
  </fieldset>;
}
