// DescriptionComponent.tsx
import React, { useId, useMemo } from 'react';

type Props = {
    /** Текст над полем */
    label: string;
    /** Контролируемое значение (если передано — компонент работает в controlled-режиме) */
    value?: string;
    /** Колбэк изменения (в controlled-режиме обязателен) */
    onChange?: (next: string) => void;
    /** Плейсхолдер внутри textarea */
    placeholder?: string;
    /** Подсказка под полем */
    helperText?: string;
    /** Флаг ошибки — подсветит поле и покажет helperText как ошибку */
    error?: boolean;
    /** Максимальная длина текста */
    maxLength?: number;
    /** Кол-во видимых строк */
    rows?: number;
    /** Отключить поле */
    disabled?: boolean;
    /** Обязательное поле (добавит * к лейблу и атрибут required) */
    required?: boolean;
    /** CSS-класс для контейнера */
    className?: string;
};

const DescriptionComponent: React.FC<Props> = ({
                                                   label,
                                                   value,
                                                   onChange,
                                                   placeholder = 'Введите описание…',
                                                   helperText,
                                                   error = false,
                                                   maxLength,
                                                   rows = 6,
                                                   disabled = false,
                                                   required = false,
                                                   className,
                                               }) => {
    // Генерируем стабильный id для связки label ↔ textarea
    const reactId = useId();
    const inputId = useMemo(() => `desc-${reactId}`, [reactId]);
    const describedById = helperText ? `${inputId}-helper` : undefined;

    // Неприменимо в controlled-режиме: локальный стейт
    const [local, setLocal] = React.useState<string>(value ?? '');

    // Синхронизация внешнего value → локального
    React.useEffect(() => {
        if (value !== undefined) setLocal(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        if (onChange) {
            onChange(next);
        } else {
            setLocal(next);
        }
    };

    const current = value !== undefined ? value : local;

    return (
        <div className={className}>
            <label
                htmlFor={inputId}
                style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}
            >
                {label} {required ? <span aria-hidden="true" style={{ color: '#d32f2f' }}>*</span> : null}
            </label>

            <textarea
                id={inputId}
                value={current}
                onChange={handleChange}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                required={required}
                aria-invalid={error || undefined}
                aria-describedby={describedById}
                style={{
                    width: '100%',
                    resize: 'vertical',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${error ? '#d32f2f' : '#d1d5db'}`,
                    outline: 'none',
                    font: 'inherit',
                    background: disabled ? '#f5f5f5' : '#fff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                }}
            />

            {(helperText || maxLength) && (
                <div
                    id={describedById}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 6,
                        fontSize: 12,
                        color: error ? '#d32f2f' : '#6b7280',
                    }}
                >
                    <span>{helperText}</span>
                    {typeof maxLength === 'number' ? (
                        <span>
              {current.length}/{maxLength}
            </span>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default DescriptionComponent;
