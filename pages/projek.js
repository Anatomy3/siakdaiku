// pages/projek.js
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import styles from '../styles/Projek.module.css';
import { FaTrash, FaSave, FaPlus, FaChevronLeft, FaChevronRight, FaExclamationCircle, FaStickyNote, FaPalette } from 'react-icons/fa';
import { Edit3, Type, Image, MoreVertical } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FontSizePicker = () => {
  const [selectedSize, setSelectedSize] = useState(14);
  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40];

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!selection.isCollapsed) {
      try {
        const selectedNode = range.commonAncestorContainer;
        const computedStyle = window.getComputedStyle(
          selectedNode.nodeType === 3 ? selectedNode.parentNode : selectedNode
        );
        const fontSize = parseInt(computedStyle.fontSize);
        if (!isNaN(fontSize) && fontSizes.includes(fontSize)) {
          setSelectedSize(fontSize);
        }
      } catch (e) {
        console.error('Error getting font size:', e);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleFontSizeChange = (size) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    
    if (!selection.isCollapsed) {
      try {
        range.surroundContents(span);
        setSelectedSize(size);
      } catch (e) {
        console.error('Error applying font size:', e);
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
    }
  };

  return (
    <div className={styles.fontSizePickerContainer}>
      <select 
        className={styles.fontSizeSelect}
        onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
        value={selectedSize}
      >
        {fontSizes.map(size => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>
    </div>
  );
};

const ColorPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const updatePickerPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePickerPosition();
      window.addEventListener('scroll', updatePickerPosition);
      window.addEventListener('resize', updatePickerPosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePickerPosition);
      window.removeEventListener('resize', updatePickerPosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const colors = [
    ['#000000', '#434343', '#666666', '#999999', '#CCCCCC', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
    ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF'],
    ['#9900FF', '#FF00FF', '#FF0066', '#A64D79', '#93C47D', '#76A5AF', '#6FA8DC', '#8E7CC3']
  ];

  const handleColorChange = (color) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    
    if (!selection.isCollapsed) {
      try {
        range.surroundContents(span);
        setSelectedColor(color);
        setIsOpen(false);
      } catch (e) {
        console.error('Error applying color:', e);
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
    }
  };

  return (
    <div className={styles.colorPickerContainer}>
      <button
        ref={buttonRef}
        className={styles.colorPickerButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Ubah Warna Teks"
      >
        <FaPalette />
      </button>
      {isOpen && createPortal(
        <div 
          ref={pickerRef}
          className={styles.colorPickerPopup}
          style={{
            position: 'fixed',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 9999
          }}
        >
          <div className={styles.colorRows}>
            {colors.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.colorRow}>
                {row.map(color => (
                  <button
                    key={color}
                    className={styles.colorButton}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
const StickyNote = ({ note, onUpdate, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(note.position);
  const [dimensions, setDimensions] = useState({
    width: note.width || 240,
    height: note.height || 160
  });
  const [initialDimensions, setInitialDimensions] = useState({ width: 0, height: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const noteRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(note.color || '#FFB13B');

  const calculateFontSize = (width, height) => {
    const baseWidth = 240;
    const baseHeight = 160;
    const baseFontSize = 14;
    const minFontSize = 2;  // Ukuran minimum font
    const maxFontSize = 24;

    // Hitung rata-rata scaling berdasarkan width dan height
    const widthScale = width / baseWidth;
    const heightScale = height / baseHeight;
    const scale = (widthScale + heightScale) / 2;

    // Hitung ukuran font baru dengan kurva lebih halus untuk ukuran kecil
    let newSize;
    if (scale < 0.2) {
      // Gunakan skala yang berbeda untuk ukuran sangat kecil
      newSize = Math.round(minFontSize + (baseFontSize - minFontSize) * (scale / 0.2));
    } else {
      newSize = Math.round(baseFontSize * scale);
    }
    
    // Terapkan batas minimum dan maksimum
    return Math.min(Math.max(newSize, minFontSize), maxFontSize);
  };

  const handleMouseDown = (e) => {
    if (e.target === noteRef.current || e.target.tagName === 'DIV') {
      setIsDragging(true);
      setInitialPosition({
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - initialPosition.x;
      const newY = e.clientY - initialPosition.y;
      
      setCurrentPosition({ x: newX, y: newY });
      onUpdate({
        ...note,
        position: { x: newX, y: newY }
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      // Batas minimum yang sangat kecil
      const newWidth = Math.max(10, initialDimensions.width + deltaX);
      const newHeight = Math.max(10, initialDimensions.height + deltaY);
      
      setDimensions({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      const fontSize = calculateFontSize(dimensions.width, dimensions.height);
      onUpdate({
        ...note,
        width: dimensions.width,
        height: dimensions.height,
        fontSize: `${fontSize}px`
      });
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    });
    setInitialDimensions({
      width: dimensions.width,
      height: dimensions.height
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, initialPosition, resizeStart, initialDimensions]);

  // Hitung ukuran font berdasarkan dimensi saat ini
  const fontSize = calculateFontSize(dimensions.width, dimensions.height);

  return (
    <div
      ref={noteRef}
      className={styles.stickyNote}
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: selectedColor,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
        position: 'absolute',
        zIndex: 1000,
        boxSizing: 'border-box',
        padding: 0
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={styles.noteContent}
        contentEditable
        suppressContentEditableWarning
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.2',
          transition: isResizing ? 'none' : 'font-size 0.2s ease',
          padding: '8px',
          margin: 0,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box'
        }}
        onMouseDown={e => e.stopPropagation()}
        dangerouslySetInnerHTML={{ __html: note.content || '' }}
        onBlur={(e) => {
          onUpdate({
            ...note,
            content: e.target.innerHTML,
            fontSize: `${fontSize}px`
          });
        }}
      />
      
      <button 
        className={styles.deleteNoteButton}
        onClick={() => onDelete(note.id)}
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '20px',
          height: '20px',
          fontSize: '16px',
          zIndex: 1001
        }}
      >
        ×
      </button>

      <div
        className={styles.resizeHandle}
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '14px',
          height: '14px',
          cursor: 'se-resize',
          zIndex: 1001
        }}
      />
    </div>
  );
};
export default function Projek() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState([]);
  const [currentStartMonth, setCurrentStartMonth] = useState(() => {
    const date = new Date();
    return {
      month: date.getMonth(),
      year: date.getFullYear()
    };
  });

  const getVisibleMonths = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const monthIndex = (currentStartMonth.month + i) % 12;
      const yearOffset = Math.floor((currentStartMonth.month + i) / 12);
      result.push({
        index: monthIndex,
        name: MONTHS[monthIndex],
        year: currentStartMonth.year + yearOffset
      });
    }
    return result;
  };

  const visibleMonths = getVisibleMonths();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handlePrevMonths = () => {
    setCurrentStartMonth(prev => {
      const newMonth = prev.month - 3;
      if (newMonth < 0) {
        return {
          month: newMonth + 12,
          year: prev.year - 1
        };
      }
      return {
        ...prev,
        month: newMonth
      };
    });
  };

  const handleNextMonths = () => {
    setCurrentStartMonth(prev => {
      const newMonth = prev.month + 3;
      if (newMonth > 11) {
        return {
          month: newMonth - 12,
          year: prev.year + 1
        };
      }
      return {
        ...prev,
        month: newMonth
      };
    });
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projek', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data proyek');
      const result = await response.json();
      setProjects(result.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Gagal mengambil data projek');
    } finally {
      setLoading(false);
    }
  };

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      content: '',
      position: { x: 100, y: 100 },
      color: '#FFB13B',
      width: 240,
      height: 160,
      fontSize: '14px'
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (updatedNote) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleCellChange = async (projectId, monthInfo, week, value) => {
    try {
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (!projectToUpdate) return;

      const monthKey = `bulan${monthInfo?.index + 1 || ''}`;
      const monthData = projectToUpdate[monthKey]?.split(',') || Array(4).fill('');
      monthData[week - 1] = value;

      const newProjects = projects.map(p => 
        p.id === projectId 
          ? { ...p, [monthKey]: monthData.join(',') }
          : p
      );
      setProjects(newProjects);
      setHasChanges(true);
    } catch (error) {
      console.error('Error memperbarui sel:', error);
      toast.error('Gagal mengupdate data');
    }
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      const savePromises = projects.map(async (project) => {
        const response = await fetch(`/api/projek?id=${project.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...project,
            status: 'saved'
          })
        });

        if (!response.ok) throw new Error('Gagal menyimpan perubahan');
      });

      await Promise.all(savePromises);
      setHasChanges(false);
      toast.success('Perubahan berhasil disimpan');
    } catch (error) {
      console.error('Error menyimpan perubahan:', error);
      toast.error('Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRow = async () => {
    try {
      const response = await fetch('/api/projek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: 'Proyek Baru',
          status: 'draft'
        })
      });

      if (!response.ok) throw new Error('Gagal menambah proyek');
      await fetchProjects();
      toast.success('Berhasil menambah proyek baru');
    } catch (error) {
      console.error('Error menambah proyek:', error);
      toast.error('Gagal menambah proyek');
    }
  };

  const toggleRowSelection = (index) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);
  };

  const handleDelete = async () => {
    if (selectedRows.size === 0) return;

    const validProjects = Array.from(selectedRows)
      .filter(index => projects[index] && projects[index].id)
      .map(index => ({
        index,
        id: projects[index].id
      }));

    if (validProjects.length === 0) {
      setSelectedRows(new Set());
      return;
    }

    try {
      const deletePromises = validProjects.map(async ({ id }) => {
        const response = await fetch(`/api/projek?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Gagal menghapus proyek ${id}`);
        }
      });

      await Promise.all(deletePromises);
      const newProjects = projects.filter((_, index) => !selectedRows.has(index));
      setProjects(newProjects);
      setSelectedRows(new Set());
      toast.success('Berhasil menghapus proyek');
    } catch (error) {
      console.error('Error dalam proses penghapusan:', error);
      toast.error('Gagal menghapus proyek');
    }
  };

  if (loading) {
    return (
      <main className={styles.mainContent}>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Memuat...</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.monthNavigation}>
          <div className={styles.leftControls}>
            <button 
              className={`${styles.toolbarBtn} ${selectedRows.size === 0 ? styles.disabled : ''}`}
              onClick={handleDelete}
              disabled={selectedRows.size === 0}
            >
              <FaTrash /> Hapus {selectedRows.size > 0 ? `(${selectedRows.size})` : ''}
            </button>
            <button 
              className={styles.toolbarBtn}
              onClick={addNote}
            >
              <FaStickyNote /> Catatan
            </button>
            <ColorPicker />
            <FontSizePicker />
          </div>

          <div className={styles.centerNavigation}>
            <button 
              className={styles.navButton} 
              onClick={handlePrevMonths}
            >
              <FaChevronLeft />
            </button>
            <span className={styles.monthRange}>
              {`${visibleMonths[0].name} ${visibleMonths[0].year} - ${visibleMonths[2].name} ${visibleMonths[2].year}`}
            </span>
            <button 
              className={styles.navButton}
              onClick={handleNextMonths}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.rightControls}>
            {hasChanges && (
              <div className={styles.saveWarning}>
                <FaExclamationCircle /> Jangan lupa untuk menyimpan
              </div>
            )}
            <button 
              className={`${styles.toolbarBtn} ${!hasChanges ? styles.disabled : ''}`}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <FaSave /> {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.headerRow}>
                  <th className={styles.noColumn} rowSpan="2">No</th>
                  <th className={styles.projectColumn} rowSpan="2">Proyek</th>
                  {visibleMonths.map(monthInfo => (
                    <th
                      key={`${monthInfo.name}-${monthInfo.year}`}
                      colSpan="4"
                      className={styles.monthHeader}
                    >
                      {monthInfo.name}
                    </th>
                  ))}
                </tr>
                <tr className={styles.headerRow}>
                  {visibleMonths.map(monthInfo => (
                    Array(4).fill(null).map((_, idx) => (
                      <th
                        key={`${monthInfo.name}-${monthInfo.year}-${idx}`}
                        className={styles.weekCell}
                      >
                        {idx + 1}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr 
                    key={project.id}
                    className={`${styles.tableRow} ${selectedRows.has(index) ? styles.selectedRow : ''}`}
                  >
                    <td 
                      className={`${styles.noColumn}`}
                      onClick={() => toggleRowSelection(index)}
                    >
                      {index + 1}
                    </td>
                    <td className={`${styles.projectColumn}`}>
                      <div
                        className={styles.projectInput}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleCellChange(project.id, null, null, e.target.textContent)}
                        dangerouslySetInnerHTML={{ __html: project.project }}
                      />
                    </td>
                    {visibleMonths.map((monthInfo) => (
                      Array(4).fill(null).map((_, weekIdx) => (
                        <td
                          key={`${monthInfo.name}-${monthInfo.year}-${weekIdx}`}
                          className={`${styles.weekCell}`}
                        >
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            className={styles.weekInput}
                            onBlur={(e) => {
                              const value = e.target.textContent;
                              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                                handleCellChange(
                                  project.id, 
                                  monthInfo,
                                  weekIdx + 1, 
                                  value
                                );
                              }
                            }}
                            dangerouslySetInnerHTML={{
                              __html: project[`bulan${monthInfo.index + 1}`]?.split(',')[weekIdx] || ''
                            }}
                          />
                        </td>
                      ))
                    ))}
                  </tr>
                ))}
                <tr className={styles.addRow}>
                  <td onClick={handleAddRow}>
                    <button className={styles.addRowButton}>
                      <FaPlus />
                    </button>
                  </td>
                  <td></td>
                  {visibleMonths.map(monthInfo => (
                    Array(4).fill(null).map((_, idx) => (
                      <td key={`${monthInfo.name}-add-${idx}`}></td>
                    ))
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        ))}
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </main>
  );
}